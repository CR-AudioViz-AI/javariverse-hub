// /api/rbac/route.ts
// Role-Based Access Control API - CR AudioViz AI
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// GET: Get roles, permissions, or user access
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'roles', 'permissions', 'user-roles', 'check-permission'
    const userId = searchParams.get('userId');
    const roleId = searchParams.get('roleId');
    const permission = searchParams.get('permission');
    const organizationId = searchParams.get('organizationId');

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    switch (action) {
      case 'roles': {
        // List all roles
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .eq('is_active', true)
          .order('level', { ascending: false });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ roles: data });
      }

      case 'permissions': {
        // List all permissions (optionally filtered by role)
        let query = supabase
          .from('permissions')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true });

        const { data, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Group by category
        const grouped = data?.reduce((acc: any, perm) => {
          const cat = perm.category || 'other';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(perm);
          return acc;
        }, {});

        return NextResponse.json({ permissions: data, grouped });
      }

      case 'role-permissions': {
        // Get permissions for a role
        if (!roleId) {
          return NextResponse.json({ error: 'roleId required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('role_permissions')
          .select(`
            permission:permissions(*)
          `)
          .eq('role_id', roleId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const permissions = data?.map(rp => rp.permission).filter(Boolean);
        return NextResponse.json({ permissions });
      }

      case 'user-roles': {
        // Get user's roles
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            *,
            role:roles(*)
          `)
          .eq('user_id', userId)
          .eq('is_active', true);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Filter expired roles
        const activeRoles = data?.filter(ur => 
          !ur.expires_at || new Date(ur.expires_at) > new Date()
        );

        return NextResponse.json({ 
          userRoles: activeRoles,
          highestRole: activeRoles?.sort((a, b) => 
            (b.role?.level || 0) - (a.role?.level || 0)
          )[0]?.role
        });
      }

      case 'user-permissions': {
        // Get all permissions for a user
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            role:roles(
              role_permissions(
                permission:permissions(name, resource, action, scope)
              )
            )
          `)
          .eq('user_id', userId)
          .eq('is_active', true);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Flatten permissions
        const permissions = new Set<string>();
        data?.forEach(ur => {
          ur.role?.role_permissions?.forEach((rp: any) => {
            if (rp.permission?.name) {
              permissions.add(rp.permission.name);
            }
          });
        });

        return NextResponse.json({ 
          permissions: Array.from(permissions),
          count: permissions.size
        });
      }

      case 'check-permission': {
        // Check if user has specific permission
        if (!userId || !permission) {
          return NextResponse.json({ error: 'userId and permission required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .rpc('user_has_permission', {
            p_user_id: userId,
            p_permission_name: permission,
            p_organization_id: organizationId || null
          });

        if (error) {
          // Fallback to manual check if function doesn't exist
          const { data: userPerms } = await supabase
            .from('user_roles')
            .select(`
              role:roles(
                role_permissions(
                  permission:permissions(name)
                )
              )
            `)
            .eq('user_id', userId)
            .eq('is_active', true);

          const hasPermission = userPerms?.some(ur =>
            ur.role?.role_permissions?.some((rp: any) =>
              rp.permission?.name === permission
            )
          );

          return NextResponse.json({ 
            hasPermission: hasPermission || false,
            permission 
          });
        }

        return NextResponse.json({ 
          hasPermission: data || false,
          permission 
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('RBAC API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Assign role to user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      roleId,
      roleName, // Alternative to roleId
      organizationId,
      grantedBy,
      expiresAt
    } = body;

    if (!userId || (!roleId && !roleName)) {
      return NextResponse.json(
        { error: 'userId and roleId (or roleName) required' },
        { status: 400 }
      );
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get role ID if name provided
    let finalRoleId = roleId;
    if (!roleId && roleName) {
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

      if (!role) {
        return NextResponse.json({ error: 'Role not found' }, { status: 404 });
      }
      finalRoleId = role.id;
    }

    // Check if already assigned
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id, is_active')
      .eq('user_id', userId)
      .eq('role_id', finalRoleId)
      .eq('organization_id', organizationId || null)
      .single();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({
          success: true,
          message: 'Role already assigned',
          userRoleId: existing.id
        });
      }

      // Reactivate
      const { data, error } = await supabase
        .from('user_roles')
        .update({
          is_active: true,
          granted_at: new Date().toISOString(),
          granted_by: grantedBy,
          expires_at: expiresAt
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Role reactivated',
        userRole: data
      });
    }

    // Create new assignment
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: finalRoleId,
        organization_id: organizationId,
        granted_by: grantedBy,
        expires_at: expiresAt,
        is_active: true
      })
      .select(`
        *,
        role:roles(name, display_name, level)
      `)
      .single();

    if (error) {
      console.error('Role assignment error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Role ${data.role?.display_name} assigned`,
      userRole: data
    });

  } catch (error) {
    console.error('RBAC API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove role from user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roleId = searchParams.get('roleId');
    const organizationId = searchParams.get('organizationId');

    if (!userId || !roleId) {
      return NextResponse.json({ error: 'userId and roleId required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Soft delete (deactivate)
    let query = supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Role removed'
    });

  } catch (error) {
    console.error('RBAC API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

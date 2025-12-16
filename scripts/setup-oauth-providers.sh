#!/bin/bash
# ============================================================================
# CR AUDIOVIZ AI - OAUTH PROVIDER SETUP SCRIPT
# Run this script after creating OAuth apps on each platform
# ============================================================================

# Supabase credentials
SUPABASE_ACCESS_TOKEN="sbp_55d684d663942eb86670a65e0eb54b6f90966d13"
PROJECT_REF="kteobfyferrukqeolofj"
API_URL="https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth"

echo "=============================================="
echo "CR AUDIOVIZ AI - OAUTH SETUP"
echo "=============================================="

# Function to enable a provider
enable_provider() {
    local provider=$1
    local client_id=$2
    local client_secret=$3
    local extra_config=$4
    
    echo "Enabling $provider..."
    
    curl -s -X PATCH \
        -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
        -H "Content-Type: application/json" \
        "${API_URL}" \
        -d "{
            \"external_${provider}_enabled\": true,
            \"external_${provider}_client_id\": \"${client_id}\",
            \"external_${provider}_secret\": \"${client_secret}\"
            ${extra_config}
        }" > /dev/null
    
    echo "✅ $provider enabled!"
}

# ============================================================================
# PROVIDER CREDENTIALS - FILL IN AFTER CREATING OAUTH APPS
# ============================================================================

# APPLE (Sign in with Apple)
# Create at: https://developer.apple.com/account/resources/identifiers/list/serviceId
# APPLE_CLIENT_ID=""      # Services ID (e.g., com.craudiovizai.auth)
# APPLE_SECRET=""         # Private key (base64 encoded)

# MICROSOFT (Azure AD)
# Create at: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
# AZURE_CLIENT_ID=""
# AZURE_SECRET=""
# AZURE_URL=""            # Usually: https://login.microsoftonline.com/common

# LINKEDIN 
# Create at: https://www.linkedin.com/developers/apps
# LINKEDIN_CLIENT_ID=""
# LINKEDIN_SECRET=""

# DISCORD
# Create at: https://discord.com/developers/applications
# DISCORD_CLIENT_ID=""
# DISCORD_SECRET=""

# FACEBOOK
# Create at: https://developers.facebook.com/apps/
# FACEBOOK_CLIENT_ID=""
# FACEBOOK_SECRET=""

# TWITTER/X
# Create at: https://developer.twitter.com/en/portal/dashboard
# TWITTER_CLIENT_ID=""
# TWITTER_SECRET=""

# ============================================================================
# UNCOMMENT AND RUN EACH SECTION AFTER ADDING CREDENTIALS
# ============================================================================

# --- APPLE ---
# enable_provider "apple" "$APPLE_CLIENT_ID" "$APPLE_SECRET"

# --- MICROSOFT ---
# curl -s -X PATCH \
#     -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
#     -H "Content-Type: application/json" \
#     "${API_URL}" \
#     -d "{
#         \"external_azure_enabled\": true,
#         \"external_azure_client_id\": \"${AZURE_CLIENT_ID}\",
#         \"external_azure_secret\": \"${AZURE_SECRET}\",
#         \"external_azure_url\": \"${AZURE_URL}\"
#     }"
# echo "✅ Microsoft enabled!"

# --- LINKEDIN ---
# curl -s -X PATCH \
#     -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
#     -H "Content-Type: application/json" \
#     "${API_URL}" \
#     -d "{
#         \"external_linkedin_oidc_enabled\": true,
#         \"external_linkedin_oidc_client_id\": \"${LINKEDIN_CLIENT_ID}\",
#         \"external_linkedin_oidc_secret\": \"${LINKEDIN_SECRET}\"
#     }"
# echo "✅ LinkedIn enabled!"

# --- DISCORD ---
# enable_provider "discord" "$DISCORD_CLIENT_ID" "$DISCORD_SECRET"

# --- FACEBOOK ---
# enable_provider "facebook" "$FACEBOOK_CLIENT_ID" "$FACEBOOK_SECRET"

# --- TWITTER ---
# enable_provider "twitter" "$TWITTER_CLIENT_ID" "$TWITTER_SECRET"

echo ""
echo "=============================================="
echo "SETUP COMPLETE"
echo "=============================================="
echo ""
echo "Callback URL for all providers:"
echo "https://kteobfyferrukqeolofj.supabase.co/auth/v1/callback"
echo ""

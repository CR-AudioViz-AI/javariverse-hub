/**
 * CR AudioViz AI - Central Gamification API
 * Leaderboards, challenges, quests, achievements, trivia
 * 
 * @author CR AudioViz AI, LLC
 * @created December 31, 2025
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // leaderboard, challenges, quests, achievements, trivia
    const user_id = searchParams.get('user_id');
    const app_id = searchParams.get('app_id');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    switch (type) {
      case 'leaderboard':
        const { data: leaders } = await supabase
          .from('user_scores')
          .select('user_id, score, rank, users(name, avatar_url)')
          .eq(app_id ? 'app_id' : 'id', app_id || 'id')
          .order('score', { ascending: false })
          .limit(limit);
        return NextResponse.json({ leaderboard: leaders || [] });

      case 'challenges':
        let challengeQuery = supabase
          .from('challenges')
          .select('*')
          .eq('status', 'active')
          .order('end_date', { ascending: true });
        if (app_id) challengeQuery = challengeQuery.eq('app_id', app_id);
        if (category) challengeQuery = challengeQuery.eq('category', category);
        const { data: challenges } = await challengeQuery;
        return NextResponse.json({ challenges: challenges || [] });

      case 'quests':
        if (!user_id) return NextResponse.json({ error: 'user_id required for quests' }, { status: 400 });
        const { data: quests } = await supabase
          .from('user_quests')
          .select('*, quests(*)')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false });
        return NextResponse.json({ quests: quests || [] });

      case 'achievements':
        if (!user_id) return NextResponse.json({ error: 'user_id required for achievements' }, { status: 400 });
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', user_id)
          .order('unlocked_at', { ascending: false });
        return NextResponse.json({ achievements: achievements || [] });

      case 'trivia':
        const { data: questions } = await supabase
          .from('trivia_questions')
          .select('id, question, options, category, difficulty')
          .eq(category ? 'category' : 'id', category || 'id')
          .order('RANDOM()')
          .limit(10);
        return NextResponse.json({ questions: questions || [] });

      default:
        return NextResponse.json({ 
          types: ['leaderboard', 'challenges', 'quests', 'achievements', 'trivia'],
          message: 'Specify type parameter'
        });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, user_id, app_id, ...data } = body;

    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

    switch (type) {
      case 'score':
        // Update user score
        const { data: score, error: scoreError } = await supabase
          .from('user_scores')
          .upsert({
            user_id,
            app_id: app_id || 'global',
            score: data.score,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,app_id' })
          .select()
          .single();
        if (scoreError) return NextResponse.json({ error: scoreError.message }, { status: 500 });
        return NextResponse.json({ success: true, score });

      case 'achievement':
        // Unlock achievement
        const { data: achievement, error: achError } = await supabase
          .from('user_achievements')
          .insert({
            user_id,
            achievement_id: data.achievement_id,
            unlocked_at: new Date().toISOString()
          })
          .select()
          .single();
        if (achError) return NextResponse.json({ error: achError.message }, { status: 500 });
        return NextResponse.json({ success: true, achievement });

      case 'quest_progress':
        // Update quest progress
        const { error: questError } = await supabase
          .from('user_quests')
          .update({ 
            progress: data.progress,
            completed: data.progress >= 100,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user_id)
          .eq('quest_id', data.quest_id);
        if (questError) return NextResponse.json({ error: questError.message }, { status: 500 });
        return NextResponse.json({ success: true });

      case 'trivia_answer':
        // Check trivia answer
        const { data: question } = await supabase
          .from('trivia_questions')
          .select('correct_answer, points')
          .eq('id', data.question_id)
          .single();
        
        const correct = question?.correct_answer === data.answer;
        if (correct) {
          await supabase.from('user_scores').upsert({
            user_id,
            app_id: app_id || 'trivia',
            score: question.points
          }, { onConflict: 'user_id,app_id' });
        }
        return NextResponse.json({ correct, points: correct ? question?.points : 0 });

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

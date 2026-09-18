import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nalisbuoztmdckpuiexh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_-FmgOul7fH4Jd4guccf3wQ_mLeFDwQU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

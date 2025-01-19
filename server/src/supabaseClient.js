import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables:');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗');
  throw new Error('Missing required Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

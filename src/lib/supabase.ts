import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing in environment variables. Using fallback for development.');
}

// Use environment variables if present, otherwise use the provided fallbacks
const url = supabaseUrl || 'https://jzafnfhavugeclomeayw.supabase.co';
const key = supabaseAnonKey || 'sb_publishable_c9lfp6J2mBq5bQTdGr9BvA_6k9baAil';

// Helper to check if we are using fallback credentials
export const isUsingFallback = !supabaseUrl || !supabaseAnonKey;

if (import.meta.env.DEV) {
  console.log('--- Supabase Connection Debug ---');
  console.log('URL:', url.substring(0, 20) + '...');
  console.log('Using Fallback:', isUsingFallback ? 'YES (Data will be empty or from demo project)' : 'NO (Using your custom project)');
  console.log('---------------------------------');
}

export const supabase = createClient(url, key);

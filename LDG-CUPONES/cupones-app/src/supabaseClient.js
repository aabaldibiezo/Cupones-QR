// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://demriceaccmszvezyepc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbXJpY2VhY2Ntc3p2ZXp5ZXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjUxMzIsImV4cCI6MjA4Njk0MTEzMn0.VdDFTrPSJNChdC7Yq9FQQQ7MnQ3BYsRtCORe0AEqwVQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
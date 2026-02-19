import { createClient } from '@supabase/supabase-js'

// Estos valores los sacas de Supabase: Settings -> API
const supabaseUrl = 'https://demriceaccmszvezyepc.supabase.co' 
const supabaseAnonKey = 'sb_publishable_0VVUtw9jajOesmDrLCEOEQ_rqrYAcbd'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
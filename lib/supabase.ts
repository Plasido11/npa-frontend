// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fsvzsxtvqxjwppwjcoec.supabase.co";
const supabaseAnonKey = "sb_publishable_anN4cSLb_N8dIhG3ZRDQqg_ukYAuTqf";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
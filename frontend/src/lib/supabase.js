import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dyzwltyxonzflkrzwqiw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5endsdHl4b256Zmxrcnp3cWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTI0NjEsImV4cCI6MjA4MDIyODQ2MX0.49Whh_4jA9NlQ7LKWBq2CPrnmgwgSpcYJH0PTs5EHm4'

export const supabase = createClient(supabaseUrl, supabaseKey)
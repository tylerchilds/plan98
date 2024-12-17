import { createClient } from '@supabase/supabase-js'

const url = plan98.env.SUPABASE_URL; // provided on admin panel
const key = plan98.env.SUPABASE_KEY; // provided on admin panel

const supabase = createClient(url, key)

export default supabase

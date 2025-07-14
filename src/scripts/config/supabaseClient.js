import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://coowhlkztecmnynhqkhs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb3dobGt6dGVjbW55bmhxa2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NTc4OTYsImV4cCI6MjA2ODAzMzg5Nn0.JuxiRgJov8j2p4fzvmo_8P0uQg4MzNjitja8osVaS3E'
export const supabase = createClient(supabaseUrl, supabaseKey)

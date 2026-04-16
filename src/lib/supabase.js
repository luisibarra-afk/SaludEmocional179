import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://iqeqirncmawadgcbiynt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZXFpcm5jbWF3YWRnY2JpeW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NDQ0NjcsImV4cCI6MjA4ODMyMDQ2N30.yfRxHNvbRiy_2LAMgencb9-reAguQuC6WONL1h9Uny4'
)

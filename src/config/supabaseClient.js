import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mhfbkgzbkfuvmsktdskd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZmJrZ3pia2Z1dm1za3Rkc2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3ODU3MzQsImV4cCI6MjA1MzM2MTczNH0.EcDVnTDPiyo7eVgYBYyrBXbYncUhnp5L6YF94HOusak'

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase

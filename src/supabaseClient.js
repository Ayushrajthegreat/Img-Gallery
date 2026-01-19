import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jezzmmtthnvetjdveyer.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplenptbXR0aG52ZXRqZHZleWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NDYyMTEsImV4cCI6MjA4NDMyMjIxMX0.3USsXaRPt4JAsR6r9nMPcoTY6gOv3g0Gx57R9OHLcxA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

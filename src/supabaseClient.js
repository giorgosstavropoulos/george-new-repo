import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjvptriklwrmcritiqcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdnB0cmlrbHdybWNyaXRpcWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTQ2MzgsImV4cCI6MjA3MTg3MDYzOH0.O9aPuRXpTTdAoXbcgFQYHwYHvpOYwzx4Anop-hd70kQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

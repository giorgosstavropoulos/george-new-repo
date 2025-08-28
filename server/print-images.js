// Prints sample Events image fields for debugging
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bjvptriklwrmcritiqcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdnB0cmlrbHdybWNyaXRpcWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTQ2MzgsImV4cCI6MjA3MTg3MDYzOH0.O9aPuRXpTTdAoXbcgFQYHwYHvpOYwzx4Anop-hd70kQ';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const { data, error } = await supabase.from('Events').select('id,image').range(0,9);
  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }
  console.log('Sample images:');
  data.forEach(d => console.log('ID', d.id, JSON.stringify(d.image)));
})();

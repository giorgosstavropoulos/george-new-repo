// Normalizes `image` field in Events table to plain public URL strings when possible.
// It reads events, attempts to resolve JSON-shaped image objects, and updates rows.
// Usage: node normalize-images.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bjvptriklwrmcritiqcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdnB0cmlrbHdybWNyaXRpcWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTQ2MzgsImV4cCI6MjA3MTg3MDYzOH0.O9aPuRXpTTdAoXbcgFQYHwYHvpOYwzx4Anop-hd70kQ';
const supabase = createClient(supabaseUrl, supabaseKey);

function resolveImage(image) {
  if (!image) return null;
  if (typeof image === 'string') return image;
  if (typeof image === 'object') {
    if (image.publicUrl) return image.publicUrl;
    if (image.url) return image.url;
    if (image.path) return image.path.startsWith('http') ? image.path : `https://bjvptriklwrmcritiqcz.supabase.co/storage/v1/object/public/event-images/${image.path}`;
    if (image.Key) return `https://bjvptriklwrmcritiqcz.supabase.co/storage/v1/object/public/event-images/${image.Key}`;
    if (image.key) return `https://bjvptriklwrmcritiqcz.supabase.co/storage/v1/object/public/event-images/${image.key}`;
  }
  try {
    const parsed = JSON.parse(image);
    return resolveImage(parsed);
  } catch (e) {
    return null;
  }
}

(async function() {
  console.log('Fetching events...');
  const { data: events, error } = await supabase.from('Events').select('id,image').limit(1000);
  if (error) {
    console.error('Error fetching events:', error);
    process.exit(1);
  }
  let updated = 0;
  for (const ev of events) {
    const imageVal = ev.image;
    const resolved = resolveImage(imageVal);
    if (resolved && typeof resolved === 'string' && !resolved.startsWith('{') && resolved !== imageVal) {
      console.log(`Updating event ${ev.id} -> ${resolved}`);
      const { error: upErr } = await supabase.from('Events').update({ image: resolved }).eq('id', ev.id);
      if (upErr) console.error('Update error for', ev.id, upErr);
      else updated++;
    }
  }
  console.log(`Done. Updated ${updated} events.`);
})();

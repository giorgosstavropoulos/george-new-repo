// Script to insert events into Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjvptriklwrmcritiqcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdnB0cmlrbHdybWNyaXRpcWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTQ2MzgsImV4cCI6MjA3MTg3MDYzOH0.O9aPuRXpTTdAoXbcgFQYHwYHvpOYwzx4Anop-hd70kQ';
const supabase = createClient(supabaseUrl, supabaseKey);

const events = [
  { artist: 'Neon Pulse', venue: 'Techno Dome', date: '2025-09-12', time: '21:00', attendees: 320, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { artist: 'Synthwave Collective', venue: 'Future Hall', date: '2025-09-18', time: '20:00', attendees: 210, image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80' },
  { artist: 'Electric Dreams', venue: 'Neon Arena', date: '2025-09-25', time: '22:00', attendees: 400, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { artist: 'Retro Vibes', venue: 'Synth Club', date: '2025-10-02', time: '19:30', attendees: 150, image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80' },
  { artist: 'Future Beats', venue: 'Pulse Hall', date: '2025-10-10', time: '20:00', attendees: 275, image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' },
  { artist: 'Night Synths', venue: 'Neon Arena', date: '2025-10-18', time: '22:00', attendees: 390, image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80' },
  { artist: 'Midnight Echoes', venue: 'Echo Hall', date: '2025-10-22', time: '20:30', attendees: 180, image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80' },
  { artist: 'Laser Groove', venue: 'Groove Club', date: '2025-10-28', time: '21:00', attendees: 220, image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80' },
  { artist: 'Pulse Machine', venue: 'Machine Arena', date: '2025-11-03', time: '22:00', attendees: 310, image: 'https://images.unsplash.com/photo-1465101178521-c1a2b1a225c1?auto=format&fit=crop&w=400&q=80' },
  { artist: 'Synth City', venue: 'City Dome', date: '2025-11-10', time: '20:00', attendees: 260, image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' },
  { artist: 'Neon Nights', venue: 'Night Club', date: '2025-11-15', time: '21:30', attendees: 340, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { artist: 'Retro Future', venue: 'Future Hall', date: '2025-11-20', time: '20:00', attendees: 200, image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80' },
];

async function insertEvents() {
  const { data, error } = await supabase.from('Events').insert(events);
  if (error) {
    console.error('Error inserting events:', error);
  } else {
    console.log('Inserted events:', data);
  }
}

insertEvents();

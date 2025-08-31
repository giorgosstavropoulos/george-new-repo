function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <h1 className="hero-title">
        <span className="gradient-text">Discover Live Music Events</span>
      </h1>
      <p className="hero-desc">
        Join the movement. Experience the future of live music.
      </p>
      <button className="btn neon hero-cta">Find Events</button>
    </section>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

function Navbar({ onOpenCreate }) {
  return (
    <nav className="navbar">
      <div className="logo">
        <span className="logo-glow">ShowGo</span>
      </div>
      <ul className="nav-links">
        <li>Home</li>
        <li>Events</li>
        <li>About</li>
        <li className="create-event-link" onClick={onOpenCreate} style={{cursor:'pointer', color:'#a855f7'}}>Create Event</li>
      </ul>
      <div className="nav-actions">
        <button className="btn neon">Sign Up</button>
        <button className="btn">Login</button>
      </div>
    </nav>
  );
}
import './App.css';
function getEventDescription(event) {
  switch (event.artist) {
    case 'Neon Pulse':
      return 'Experience a night of electrifying beats and neon lights as Neon Pulse takes the stage. Perfect for fans of futuristic dance music.';
    case 'Synthwave Collective':
      return 'Dive into retro-futuristic vibes with Synthwave Collective. Expect synth-heavy tracks and a dazzling light show.';
    case 'Electric Dreams':
      return 'Electric Dreams brings you a blend of electronic rhythms and dreamy melodies. A must-see for lovers of immersive soundscapes.';
    case 'Retro Vibes':
      return 'Get ready to groove to classic and modern dance hits with Retro Vibes. A nostalgic journey with a modern twist.';
    case 'Future Beats':
      return 'Future Beats delivers cutting-edge music and energetic performances. Join the crowd for a night of innovation and rhythm.';
    case 'Night Synths':
      return 'Night Synths creates a mesmerizing atmosphere with deep synths and pulsing bass. Dance the night away in style.';
    case 'Midnight Echoes':
      return 'Midnight Echoes will captivate you with haunting melodies and powerful dance anthems. An unforgettable late-night experience.';
    case 'Laser Groove':
      return 'Laser Groove combines high-energy dance tracks with a spectacular laser show. Don’t miss this visual and musical feast.';
    case 'Pulse Machine':
      return 'Pulse Machine brings relentless energy and infectious beats. Perfect for those who love to move and feel the music.';
    case 'Synth City':
      return 'Synth City offers a cityscape of sound, blending urban rhythms with synth magic. A unique event for music explorers.';
    case 'Neon Nights':
      return 'Neon Nights lights up the club with vibrant colors and dynamic dance music. Join the party and shine bright.';
    case 'Retro Future':
      return 'Retro Future fuses past and future sounds for a truly original dance experience. Step into tomorrow with a touch of nostalgia.';
    default:
      return 'Join us for an amazing night of music, dance, and unforgettable memories!';
  }
}

function EventsGrid({ 
  showDeleteConfirm, 
  setShowDeleteConfirm, 
  deleteLoading, 
  setDeleteLoading, 
  handleDeleteEvent, 
  confirmDelete,
  selectedEvent,
  setSelectedEvent 
}) {
  const [events, setEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Supabase config
  const supabaseUrl = 'https://bjvptriklwrmcritiqcz.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdnB0cmlrbHdybWNyaXRpcWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTQ2MzgsImV4cCI6MjA3MTg3MDYzOH0.O9aPuRXpTTdAoXbcgFQYHwYHvpOYwzx4Anop-hd70kQ';
  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase.from('Events').select('*').order('date', { ascending: true });
      if (error) {
        setError(error.message);
        setEvents([]);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount(count => count + 6);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  if (loading) return <div className="events-grid"><p>Loading events...</p></div>;
  if (error) return <div className="events-grid"><p style={{color: 'red'}}>Error: {error}</p></div>;

  // Helper to handle different image shapes (string URL, JSON object, storage Key)
  function resolveImageField(image) {
    if (!image) return '';
    // already a string URL
    if (typeof image === 'string') return image;
    // If returned from Supabase as JSON string, try parse
    try {
      if (typeof image === 'object') {
        // common keys
        if (image.publicUrl) return image.publicUrl;
        if (image.url) return image.url;
        if (image.path) return image.path;
        if (image.Key) return `https://bjvptriklwrmcritiqcz.supabase.co/storage/v1/object/public/event-images/${image.Key}`;
        // try nested url
        if (image?.metadata?.publicUrl) return image.metadata.publicUrl;
      }
      const maybe = JSON.parse(JSON.stringify(image));
      if (maybe && typeof maybe === 'object') {
        if (maybe.publicUrl) return maybe.publicUrl;
        if (maybe.url) return maybe.url;
        if (maybe.Key) return `https://bjvptriklwrmcritiqcz.supabase.co/storage/v1/object/public/event-images/${maybe.Key}`;
      }
    } catch (e) {
      // fall through
      console.warn('resolveImageField parse error', e);
    }
    return '';
  }

  return (
    <>
      <section className="events-grid">
    {events.slice(0, visibleCount).map(event => (
          <div className="event-card" key={event.id}>
      <img src={resolveImageField(event.image) || '/Octocat.png'} alt={event.artist} className="event-img" />
            <div className="event-info">
              <h2 className="event-artist">{event.artist}</h2>
              <p className="event-venue">{event.venue}</p>
              <p className="event-date">{event.date} &bull; {event.time}</p>
              <p className="event-attendees">Attendees: {event.attendees}</p>
              {/* price removed */}
              <button className="btn neon event-action" onClick={() => handleViewDetails(event)}>View Details</button>
            </div>
          </div>
        ))}
        {visibleCount < events.length && (
          <div className="load-more-container">
            <button className="btn neon" onClick={handleLoadMore}>Load More Events</button>
          </div>
        )}
      </section>
      {selectedEvent && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <img src={resolveImageField(selectedEvent.image) || '/Octocat.png'} alt={selectedEvent.artist} className="modal-img" />
            <h2>{selectedEvent.artist}</h2>
            <p><strong>Venue:</strong> {selectedEvent.venue}</p>
            <p><strong>Date:</strong> {selectedEvent.date}</p>
            <p><strong>Time:</strong> {selectedEvent.time}</p>
            <p><strong>Attendees:</strong> {selectedEvent.attendees}</p>
            {/* price removed */}
            <div className="modal-about">
              <h3>About this event</h3>
              <p>{getEventDescription(selectedEvent)}</p>
            </div>
            <div className="modal-actions">
              <div className="modal-actions-left">
                <button className="btn btn-edit" onClick={() => handleEditEvent(selectedEvent)}>Edit</button>
                <button className="btn btn-delete" onClick={() => confirmDelete(selectedEvent)}>Delete</button>
              </div>
              <button className="btn neon" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}>
          <div className="modal modal-confirm" onClick={e => e.stopPropagation()}>
            <h3 className="confirm-title">Delete Event</h3>
            <p className="confirm-message">
              Are you sure you want to delete "<strong>{showDeleteConfirm.artist}</strong>" at {showDeleteConfirm.venue}?
              <br />This action cannot be undone.
            </p>
            <div className="confirm-actions">
              <button className="btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button 
                className="btn btn-delete" 
                onClick={() => handleDeleteEvent(showDeleteConfirm)}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Supabase config (reuse from EventsGrid)
  const supabaseUrl = 'https://bjvptriklwrmcritiqcz.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdnB0cmlrbHdybWNyaXRpcWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTQ2MzgsImV4cCI6MjA3MTg3MDYzOH0.O9aPuRXpTTdAoXbcgFQYHwYHvpOYwzx4Anop-hd70kQ';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Refs for form fields
  const venueRef = useRef();
  const organizerRef = useRef();
  const categoryRef = useRef();
  const imageRef = useRef();
  const descRef = useRef();
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const handleEditEvent = (event) => {
    // TODO: Implement edit functionality
    console.log('Edit event:', event);
    alert('Edit functionality coming soon!');
  };

  const handleDeleteEvent = async (event) => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase.from('Events').delete().eq('id', event.id);
      if (error) {
        console.error('Delete error:', error);
        alert('Failed to delete event: ' + error.message);
      } else {
        alert('Event deleted successfully!');
        setSelectedEvent(null);
        setShowDeleteConfirm(false);
        // Refresh the page to show updated events list
        window.location.reload();
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete event');
    }
    setDeleteLoading(false);
  };

  const confirmDelete = (event) => {
    setShowDeleteConfirm(event);
  };

  async function handleCreateEvent(e) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);
    // Get form values
    const venue = venueRef.current.value;
    const organizer = organizerRef.current.value;
    const category = categoryRef.current.value;
    const description = descRef.current.value;
  const imageFile = imageRef.current?.files?.[0];
  const dateVal = dateValue || '';
  const timeVal = timeValue || '';
  if (!venue || !organizer || !category || !description || !dateVal || !timeVal) {
      setCreateError('Please fill all required fields. Image is optional.');
      setCreateLoading(false);
      return;
    }
    let imageUrl = '';
    if (imageFile) {
      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
      let imgData;
      let imgError;
      try {
        ({ data: imgData, error: imgError } = await supabase.storage.from('event-images').upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        }));
        console.log('Initial upload result', { imgData, imgError });
      } catch (err) {
        imgError = err;
        console.error('Upload threw error', err);
      }

      // If bucket doesn't exist, attempt to create it via local server endpoint (requires service role key on server)
      if (imgError && /bucket not found|Bucket not found|404/i.test(imgError.message || imgError)) {
        try {
          console.log('Bucket missing; calling local create-bucket endpoint');
          const createRes = await fetch('http://localhost:8787/create-bucket', { method: 'POST' });
          const createText = await createRes.text();
          console.log('create-bucket response', { status: createRes.status, text: createText });
          if (!createRes.ok) {
            setCreateError('Image bucket missing and server-side creation failed. Server response: ' + createText + ' (status ' + createRes.status + ')');
            setCreateLoading(false);
            return;
          }
          // Retry upload after server created bucket
          const retry = await supabase.storage.from('event-images').upload(fileName, imageFile, { cacheControl: '3600', upsert: false });
          imgData = retry.data;
          imgError = retry.error;
          console.log('Retry upload result', { imgData, imgError });
        } catch (retryErr) {
          console.error('Retry threw error', retryErr);
          setCreateError('Image upload retry failed: ' + (retryErr.message || JSON.stringify(retryErr)));
          setCreateLoading(false);
          return;
        }
      }
      if (imgError) {
        console.error('Final upload error object:', imgError);
        setCreateError('Image upload failed: ' + (imgError.message || JSON.stringify(imgError)));
        setCreateLoading(false);
        return;
      }
      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('event-images').getPublicUrl(fileName);
      console.log('publicUrlData', publicUrlData);
      imageUrl = publicUrlData?.publicUrl || '';
      if (!imageUrl) {
        setCreateError('Could not get image URL.');
        setCreateLoading(false);
        return;
      }
    }

    
    // Insert event row
  const { error: insertError } = await supabase.from('Events').insert([
      {
        artist: organizer,
        venue,
        category,
        image: imageUrl,
        description,
    date: dateVal,
    time: timeVal,
        attendees: 0
      }
    ]);
    if (insertError) {
      setCreateError('Event creation failed: ' + insertError.message);
      setCreateLoading(false);
      return;
    }
    setCreateSuccess('Event created!');
    setCreateLoading(false);
    setTimeout(() => {
      setShowCreateModal(false);
      setCreateSuccess(null);
      setImagePreview(null);
      setDateValue('');
      setTimeValue('');
    }, 1200);
    // Optionally, refresh events list here
    window.location.reload();
  }

  function handleImageChange() {
    const file = imageRef.current.files[0];
    if (!file) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  return (
    <div className="showgo-bg">
  {/* small debug banner removed to avoid overlaying interactive elements */}
      <Navbar onOpenCreate={() => setShowCreateModal(true)} />
      <Hero />
      <EventsGrid 
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        deleteLoading={deleteLoading}
        setDeleteLoading={setDeleteLoading}
        handleDeleteEvent={handleDeleteEvent}
        confirmDelete={confirmDelete}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
      />
      {showCreateModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
          <div className="modal modal-lg neon-border" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title gradient-text">Create New Event</h2>
            <p className="modal-subtitle">Fill in the details to create your music event</p>
            <form className="create-event-form dark-form" onSubmit={handleCreateEvent}>
              <div className="form-row">
                <input ref={venueRef} type="text" className="form-input neon-input" placeholder="Enter venue name and address" />
              </div>
              <div className="form-row form-row-2col">
                <div className="form-group">
                  <label className="form-label"><span className="icon">👤</span> Organizer</label>
                  <input ref={organizerRef} type="text" className="form-input neon-input" placeholder="Event organizer name" />
                </div>
                <div className="form-group">
                  <label className="form-label"><span className="icon">📅</span> Date</label>
                  <input value={dateValue} onChange={e => setDateValue(e.target.value)} type="date" className="form-input neon-input" />
                </div>
              </div>
              <div className="form-row form-row-2col">
                <div className="form-group">
                  <label className="form-label"><span className="icon">🏷️</span> Category</label>
                  <select ref={categoryRef} className="form-input neon-input"><option>General</option><option>Concert</option><option>Festival</option><option>Club</option></select>
                </div>
                <div className="form-group">
                  <label className="form-label"><span className="icon">⏰</span> Time</label>
                  <input value={timeValue} onChange={e => setTimeValue(e.target.value)} type="time" className="form-input neon-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label"><span className="icon">🖼️</span> Event Image</label>
                <input ref={imageRef} onChange={handleImageChange} type="file" className="form-input neon-input file-input" accept="image/*" />
                <div className="form-helper">Supported formats: JPG, PNG, GIF. Max size: 5MB</div>
              </div>
              <div className="form-group">
                <label className="form-label"><span className="icon">📝</span> Event Description</label>
                <textarea ref={descRef} className="form-input neon-input" placeholder="Describe your event, performers, and what attendees can expect..." rows={4}></textarea>
              </div>
              {imagePreview && (
                <div style={{textAlign:'center', marginTop:'1rem'}}>
                  <img src={imagePreview} alt="preview" style={{maxWidth:'200px',borderRadius:'8px',boxShadow:'0 0 16px #a855f7aa'}} />
                </div>
              )}
              <button type="submit" className="btn neon modal-submit" disabled={createLoading}>{createLoading ? 'Creating...' : 'Create Event'}</button>
              {createError && <div style={{color:'#f87171',marginTop:'1rem'}}>{createError}</div>}
              {createSuccess && <div style={{color:'#4ade80',marginTop:'1rem'}}>{createSuccess}</div>}
            </form>
            <button className="btn modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from 'react';
import supabase from './supabaseClient';
import './App.css';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import EventsGrid from './components/EventsGrid';


function App() {
  const [route, setRoute] = useState('home'); // 'home' | 'profile'
  const [userCreatedEvents, setUserCreatedEvents] = useState([]);
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [profileTab, setProfileTab] = useState('attending'); // 'attending' | 'created'
  // keep currentUser declared before any effects that reference it
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // navigation events
  useEffect(() => {
    const goHome = () => setRoute('home');
    const openProfile = () => setRoute('profile');
    window.addEventListener('go-home', goHome);
    window.addEventListener('open-profile', openProfile);
    return () => { window.removeEventListener('go-home', goHome); window.removeEventListener('open-profile', openProfile); };
  }, []);

  useEffect(() => {
    async function fetchUserCreated() {
      if (!currentUser) return setUserCreatedEvents([]);
      try {
        // Fetch events and filter client-side to handle cases where creator_id wasn't set
        const res = await supabase.from('Events').select('*').order('date', { ascending: true });
        const { data, error } = res;
        if (error) {
          console.error('fetchUserCreated error', error);
          setUserCreatedEvents([]);
        } else {
          const displayName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.fullName || currentUser?.full_name || currentUser?.name || currentUser?.email || '';
          const email = currentUser?.email || '';
          const filtered = (data || []).filter(ev => {
            if (!ev) return false;
            // match by creator_id if present
            if (ev.creator_id && currentUser?.id && String(ev.creator_id) === String(currentUser.id)) return true;
            // fallback: match by artist name or email (covers older inserts)
            if (String(ev.artist || '').trim() && (String(ev.artist).trim() === String(displayName).trim())) return true;
            if (String(ev.artist || '').trim() && (String(ev.artist).trim() === String(email).trim())) return true;
            return false;
          }).sort((a,b) => new Date(a.date) - new Date(b.date));
          setUserCreatedEvents(filtered || []);
        }
      } catch (err) {
        console.error('fetchUserCreated threw', err);
        setUserCreatedEvents([]);
      }
    }
    fetchUserCreated();
  }, [currentUser]);

  // Fetch events the current user is attending
  useEffect(() => {
    let mounted = true;
    async function fetchAttendingEvents() {
      if (!currentUser) return mounted && setAttendingEvents([]);
      try {
        const { data: attendRows, error: attendErr } = await supabase.from('event_attendees').select('event_id').eq('user_id', currentUser.id);
        if (attendErr) {
          console.error('fetchAttendingEvents attendRows error', attendErr);
          if (mounted) setAttendingEvents([]);
          return;
        }
        const ids = (attendRows || []).map(r => String(r.event_id)).filter(Boolean);
        if (ids.length === 0) {
          if (mounted) setAttendingEvents([]);
          return;
        }
        // If all ids look numeric, query as numbers to match Events.id if it's numeric
        const allNumeric = ids.every(id => /^\d+$/.test(id));
        const queryIds = allNumeric ? ids.map(n => Number(n)) : ids;
        const { data: eventsData, error: eventsErr } = await supabase.from('Events').select('*').in('id', queryIds).order('date', { ascending: true });
        if (eventsErr) {
          console.error('fetchAttendingEvents events error', eventsErr);
          if (mounted) setAttendingEvents([]);
          return;
        }
        if (mounted) setAttendingEvents(eventsData || []);
      } catch (err) {
        console.error('fetchAttendingEvents threw', err);
        if (mounted) setAttendingEvents([]);
      }
    }
    fetchAttendingEvents();

    // Re-fetch when attendance changes elsewhere in the UI
    const handler = (e) => { fetchAttendingEvents(); };
    window.addEventListener('event-attendance-changed', handler);
    window.addEventListener('event-created', handler);
    return () => { mounted = false; window.removeEventListener('event-attendance-changed', handler); window.removeEventListener('event-created', handler); };
  }, [currentUser]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editVenue, setEditVenue] = useState('');
  const [editOrganizer, setEditOrganizer] = useState('');
  const [editCategory, setEditCategory] = useState('General');
  const [editDateValue, setEditDateValue] = useState('');
  const [editTimeValue, setEditTimeValue] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImagePreview, setEditImagePreview] = useState(null);
  const editImageRef = useRef();

  // Using shared supabase client imported from src/supabaseClient.js

  // Refs for form fields
  const venueRef = useRef();
  const categoryRef = useRef();
  const imageRef = useRef();
  const descRef = useRef();
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const handleEditEvent = (event) => {
    // populate edit form and open modal
    setEditEvent(event);
    setEditVenue(event.venue || '');
    setEditOrganizer(event.artist || '');
    setEditCategory(event.category || 'General');
    setEditDateValue(event.date || '');
    setEditTimeValue(event.time || '');
    setEditDesc(event.description || '');
    setEditImagePreview(typeof event.image === 'string' ? event.image : '');
    setShowEditModal(true);
  };

  function handleEditImageChange() {
    const file = editImageRef.current?.files?.[0];
    if (!file) {
      setEditImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setEditImagePreview(url);
  }

  async function handleUpdateEvent(e) {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    if (!currentUser) {
      alert('You must be logged in to edit events');
      setShowEditModal(false);
      setShowLoginModal(true);
      setEditLoading(false);
      return;
    }
    if (!editEvent) {
      setEditError('No event selected to edit');
      setEditLoading(false);
      return;
    }
    // prepare update payload
    const updated = {
      artist: editOrganizer,
      venue: editVenue,
      category: editCategory,
      description: editDesc,
      date: editDateValue,
      time: editTimeValue,
    };

    // handle optional image upload
    const imageFile = editImageRef.current?.files?.[0];
    if (imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
        const { data: imgData, error: imgError } = await supabase.storage.from('event-images').upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
        if (imgError) {
          // try to create bucket via local endpoint if missing (same flow as create)
          if (/bucket not found|Bucket not found|404/i.test(imgError.message || imgError)) {
            const createRes = await fetch('http://localhost:8787/create-bucket', { method: 'POST' });
            if (createRes.ok) {
              const retry = await supabase.storage.from('event-images').upload(fileName, imageFile, { cacheControl: '3600', upsert: false });
              if (retry.error) throw retry.error;
              const { data: publicUrlData } = supabase.storage.from('event-images').getPublicUrl(fileName);
              updated.image = publicUrlData?.publicUrl || '';
            } else {
              throw new Error('Bucket missing and server could not create it');
            }
          } else {
            throw imgError;
          }
        } else {
          const { data: publicUrlData } = supabase.storage.from('event-images').getPublicUrl(fileName);
          updated.image = publicUrlData?.publicUrl || '';
        }
      } catch (imgErr) {
        console.error('Image upload failed during edit', imgErr);
        setEditError('Image upload failed: ' + (imgErr.message || JSON.stringify(imgErr)));
        setEditLoading(false);
        return;
      }
    }

    try {
      const { error } = await supabase.from('Events').update(updated).eq('id', editEvent.id);
      if (error) {
        console.error('Update error:', error);
        setEditError(error.message);
        setEditLoading(false);
        return;
      }
      // close modal and refresh to show changes (keeps consistency with other flows)
      setShowEditModal(false);
      setEditEvent(null);
      window.location.reload();
    } catch (err) {
      console.error('Update threw', err);
      setEditError('Update failed: ' + (err.message || JSON.stringify(err)));
    }
    setEditLoading(false);
  }

  const handleDeleteEvent = async (event) => {
    setDeleteLoading(true);
    if (!currentUser) {
      alert('You must be logged in to delete events');
      setShowLoginModal(true);
      setDeleteLoading(false);
      return;
    }
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
    if (!currentUser) {
      alert('You must be logged in to create events');
      setShowCreateModal(false);
      setShowLoginModal(true);
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);
    console.debug('handleCreateEvent: started');
    const watchdog = setTimeout(() => {
      console.warn('handleCreateEvent: watchdog fired - clearing loading');
      setCreateLoading(false);
      setCreateError('Request timed out. Please try again.');
    }, 20000);
    try {
      // Get form values
      const venue = venueRef.current.value;
      // Set organizer/artist from the logged-in user's display name (fallback to email)
      const organizer = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.fullName || currentUser?.full_name || currentUser?.name || currentUser?.email || 'Organizer';
      const category = categoryRef.current.value;
      const description = descRef.current.value;
      const imageFile = imageRef.current?.files?.[0];
      const dateVal = dateValue || '';
      const timeVal = timeValue || '';
      if (!venue || !category || !description || !dateVal || !timeVal) {
        setCreateError('Please fill all required fields. Image is optional.');
        console.debug('handleCreateEvent: missing fields', { venue, category, description, dateVal, timeVal });
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

      // Insert event row (include creator_id so profile can list created events)
      let insertedData = null;
      try {
        const res = await supabase.from('Events').insert([
          {
            artist: organizer,
            venue,
            category,
            image: imageUrl,
            description,
            date: dateVal,
            time: timeVal,
            attendees: 0,
            creator_id: currentUser?.id || null
          }
        ]).select();
        insertedData = res.data;
        if (res.error) throw res.error;
      } catch (firstErr) {
        // If the schema doesn't have creator_id yet (common during migrations), retry without it
        if (/creator_id|Could not find the 'creator_id' column/i.test(String(firstErr.message || firstErr))) {
          console.warn('creator_id missing in schema, retrying insert without creator_id');
          try {
            const res2 = await supabase.from('Events').insert([
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
            ]).select();
            insertedData = res2.data;
            if (res2.error) throw res2.error;
          } catch (secondErr) {
            setCreateError('Event creation failed: ' + (secondErr.message || String(secondErr)));
            console.error('Insert retry error', secondErr);
            setCreateLoading(false);
            return;
          }
        } else {
          setCreateError('Event creation failed: ' + (firstErr.message || String(firstErr)));
          console.error('Insert error', firstErr);
          setCreateLoading(false);
          return;
        }
      }
  const newEvent = Array.isArray(insertedData) ? insertedData[0] : insertedData;
      setCreateSuccess('Event created!');
      // Optimistically update the profile's created events list and the global events list via a window event
      try {
        setUserCreatedEvents(prev => [newEvent, ...(prev || [])]);
        window.dispatchEvent(new CustomEvent('event-created', { detail: newEvent }));
      } catch (err) {
        console.warn('Optimistic update failed', err);
      }
      // Close modal and clear inputs (no reload)
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(null);
        setImagePreview(null);
        setDateValue('');
        setTimeValue('');
      }, 1200);
    } catch (err) {
      console.error('handleCreateEvent threw', err);
      setCreateError('Event creation failed: ' + (err?.message || String(err)));
    } finally {
      clearTimeout(watchdog);
      console.debug('handleCreateEvent: finishing, clearing loading');
      setCreateLoading(false);
    }
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

  // open join modal when Hero dispatches event
  useEffect(() => {
    const handler = () => setShowJoinModal(true);
    window.addEventListener('open-join-modal', handler);
    return () => window.removeEventListener('open-join-modal', handler);
  }, []);

  // open login modal when Join footer dispatches event
  useEffect(() => {
    const handler = () => setShowLoginModal(true);
    window.addEventListener('open-signin-modal', handler);
    return () => window.removeEventListener('open-signin-modal', handler);
  }, []);

  // check existing session/user on mount
  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error && mounted) setCurrentUser(data?.user || null);
      } catch (err) {
        console.warn('getUser err', err);
      }
    }
    fetchUser();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setCurrentUser(session?.user ?? null);
      }
      if (event === 'SIGNED_OUT') setCurrentUser(null);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  async function handleJoinSubmit(e) {
    e.preventDefault();
    if (!joinName || !joinEmail || !joinPassword) {
      alert('Please provide name, email and password');
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({ email: joinEmail, password: joinPassword, options: { data: { full_name: joinName } } });
      if (error) {
        console.error('Sign up error', error);
        alert('Sign up failed: ' + error.message);
        return;
      }
      // If the project uses email confirmation, user may be null and data will contain session info
      if (data?.user) {
        setCurrentUser(data.user);
        alert('Account created and signed in');
      } else {
        alert('Account created. Please check your email to confirm your account if required.');
      }
      setShowJoinModal(false);
      setJoinName(''); setJoinEmail(''); setJoinPassword('');
    } catch (err) {
      console.error('Sign up threw', err);
      alert('Sign up error');
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      alert('Please provide email and password');
      return;
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) {
        console.error('Login error', error);
        alert('Login failed: ' + error.message);
        return;
      }
      setCurrentUser(data.user ?? null);
      alert('Logged in successfully');
      setShowLoginModal(false);
      setLoginEmail(''); setLoginPassword('');
    } catch (err) {
      console.error('Login threw', err);
      alert('Login error');
    }
  }

  async function handleLogout() {
    // optimistic: immediately update UI, track logging-out state
    setIsLoggingOut(true);
    setCurrentUser(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error', err);
      alert('Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="showgo-bg">
  {/* small debug banner removed to avoid overlaying interactive elements */}
  <Navbar onOpenCreate={() => setShowCreateModal(true)} onOpenLogin={() => setShowLoginModal(true)} onOpenJoin={() => setShowJoinModal(true)} currentUser={currentUser} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      <Hero currentUser={currentUser} onOpenCreate={() => setShowCreateModal(true)} />
      {route === 'profile' ? (
        <div style={{padding:'1.5rem'}}>
          <button className="btn" onClick={() => setRoute('home')}>← Back</button>
          <div style={{display:'flex', gap:'1rem', alignItems:'center', marginTop:'1rem'}}>
            <div style={{width:64,height:64,borderRadius:32,background:'#6ee7b7'}} />
            <div>
              <div style={{fontSize:'1.25rem', color:'#e6e6ff'}}>{currentUser ? (currentUser.user_metadata?.full_name || currentUser.email) : 'Display Name'}</div>
              <div style={{fontSize:'0.9rem', color:'#94a3b8'}}>{currentUser?.email}</div>
            </div>
          </div>
          <div style={{marginTop:'1rem', display:'flex', gap:'0.5rem'}}>
            <button className={`btn ${profileTab === 'attending' ? 'active' : ''}`} onClick={() => setProfileTab('attending')}>
              Events Attending ({attendingEvents?.length || 0})
            </button>
            <button className={`btn ${profileTab === 'created' ? 'active' : ''}`} onClick={() => setProfileTab('created')}>
              Events Created ({userCreatedEvents?.length || 0})
            </button>
          </div>
          <div style={{marginTop:'1rem'}}>
            {profileTab === 'attending' ? (
              (attendingEvents && attendingEvents.length > 0) ? (
                <section className="events-grid">
                  {attendingEvents.map(ev => (
                    <div className="event-card" key={ev.id}>
                      <img src={(typeof ev.image === 'string' && ev.image) || '/Octocat.png'} alt={ev.artist} className="event-img" />
                      <div className="event-info">
                        <h2 className="event-artist">{ev.artist}</h2>
                        <p className="event-venue">{ev.venue}</p>
                        <p className="event-date">{ev.date} &bull; {ev.time}</p>
                        <p className="event-attendees">Attendees: {ev.attendees}</p>
                        <p className="event-desc" style={{color:'#cbd5e1', marginTop:'0.5rem'}}>{ev.description || 'No description provided.'}</p>
                      </div>
                    </div>
                  ))}
                </section>
              ) : (
                <div style={{color:'#cbd5e1'}}>You are not attending any events yet.</div>
              )
            ) : (
              <section className="events-grid">
                {userCreatedEvents.map(ev => (
                  <div className="event-card" key={ev.id}>
                    <img src={(typeof ev.image === 'string' && ev.image) || '/Octocat.png'} alt={ev.artist} className="event-img" />
                    <div className="event-info">
                      <h2 className="event-artist">{ev.artist}</h2>
                      <p className="event-venue">{ev.venue}</p>
                      <p className="event-date">{ev.date} &bull; {ev.time}</p>
                      <p className="event-attendees">Attendees: {ev.attendees}</p>
                      <p className="event-desc" style={{color:'#cbd5e1', marginTop:'0.5rem'}}>{ev.description || 'No description provided.'}</p>
                    </div>
                  </div>
                ))}
                {userCreatedEvents.length === 0 && <div style={{color:'#cbd5e1'}}>You haven't created any events yet.</div>}
              </section>
            )}
          </div>
        </div>
      ) : (
      <EventsGrid 
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        deleteLoading={deleteLoading}
        setDeleteLoading={setDeleteLoading}
        handleDeleteEvent={handleDeleteEvent}
        confirmDelete={confirmDelete}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
  handleEditEvent={handleEditEvent}
  currentUser={currentUser}
      />
  )}
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
                  <label className="form-label"><span className="icon">�</span> Date</label>
                  <input value={dateValue} onChange={e => setDateValue(e.target.value)} type="date" className="form-input neon-input" />
                </div>
                <div className="form-group">
                  <label className="form-label"><span className="icon">�</span> (Organizer is set to your account)</label>
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
      {showJoinModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowJoinModal(false); }}>
          <div className="modal modal-md neon-border" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title gradient-text">Create an Account</h2>
            <p className="modal-subtitle">Enter your name and email to create a free account</p>
            <form className="create-event-form dark-form" onSubmit={handleJoinSubmit}>
              <div className="form-row">
                <input value={joinName} onChange={e => setJoinName(e.target.value)} type="text" className="form-input neon-input" placeholder="Full name" />
              </div>
              <div className="form-row">
                <input value={joinEmail} onChange={e => setJoinEmail(e.target.value)} type="email" className="form-input neon-input" placeholder="Email address" />
              </div>
              <div className="form-row">
                <input value={joinPassword} onChange={e => setJoinPassword(e.target.value)} type="password" className="form-input neon-input" placeholder="Password" />
              </div>
              <button type="submit" className="btn neon modal-submit">Create Account</button>
            </form>
            <div style={{display:'flex', gap:'.5rem', alignItems:'center', justifyContent:'space-between', marginTop:'0.75rem'}}>
              <div style={{fontSize:'0.95rem', color:'#cbd5e1'}}>
                Already have an account? <button type="button" className="btn-link" onClick={() => { setShowJoinModal(false); window.dispatchEvent(new CustomEvent('open-signin-modal')); }} style={{background:'none',border:'none',color:'#a855f7',cursor:'pointer',padding:0}}>Login</button>
              </div>
              <button className="btn modal-cancel" onClick={() => setShowJoinModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showLoginModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}>
          <div className="modal modal-md neon-border" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title gradient-text">Login</h2>
            <p className="modal-subtitle">Enter your email and password to login</p>
            <form className="create-event-form dark-form" onSubmit={handleLoginSubmit}>
              <div className="form-row">
                <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" className="form-input neon-input" placeholder="Email address" />
              </div>
              <div className="form-row">
                <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} type="password" className="form-input neon-input" placeholder="Password" />
              </div>
              <button type="submit" className="btn neon modal-submit">Login</button>
            </form>
            <div style={{display:'flex', gap:'.5rem', alignItems:'center', justifyContent:'space-between', marginTop:'0.75rem'}}>
              <div style={{fontSize:'0.95rem', color:'#cbd5e1'}}>
                Don't have an account? <button type="button" className="btn-link" onClick={() => { setShowLoginModal(false); window.dispatchEvent(new CustomEvent('open-join-modal')); }} style={{background:'none',border:'none',color:'#a855f7',cursor:'pointer',padding:0}}>Join Now</button>
              </div>
              <button className="btn modal-cancel" onClick={() => setShowLoginModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && editEvent && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="modal modal-lg neon-border" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title gradient-text">Edit Event</h2>
            <p className="modal-subtitle">Update event details below</p>
            <form className="create-event-form dark-form" onSubmit={handleUpdateEvent}>
              <div className="form-row">
                <input value={editVenue} onChange={e => setEditVenue(e.target.value)} type="text" className="form-input neon-input" placeholder="Enter venue name and address" />
              </div>
              <div className="form-row form-row-2col">
                <div className="form-group">
                  <label className="form-label"><span className="icon">👤</span> Organizer</label>
                  <input value={editOrganizer} onChange={e => setEditOrganizer(e.target.value)} type="text" className="form-input neon-input" placeholder="Event organizer name" />
                </div>
                <div className="form-group">
                  <label className="form-label"><span className="icon">📅</span> Date</label>
                  <input value={editDateValue} onChange={e => setEditDateValue(e.target.value)} type="date" className="form-input neon-input" />
                </div>
              </div>
              <div className="form-row form-row-2col">
                <div className="form-group">
                  <label className="form-label"><span className="icon">🏷️</span> Category</label>
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="form-input neon-input"><option>General</option><option>Concert</option><option>Festival</option><option>Club</option></select>
                </div>
                <div className="form-group">
                  <label className="form-label"><span className="icon">⏰</span> Time</label>
                  <input value={editTimeValue} onChange={e => setEditTimeValue(e.target.value)} type="time" className="form-input neon-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label"><span className="icon">🖼️</span> Event Image (optional)</label>
                <input ref={editImageRef} onChange={handleEditImageChange} type="file" className="form-input neon-input file-input" accept="image/*" />
                <div className="form-helper">Upload to replace existing image.</div>
              </div>
              <div className="form-group">
                <label className="form-label"><span className="icon">📝</span> Event Description</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="form-input neon-input" placeholder="Describe your event..." rows={4}></textarea>
              </div>
              {editImagePreview && (
                <div style={{textAlign:'center', marginTop:'1rem'}}>
                  <img src={editImagePreview} alt="preview" style={{maxWidth:'200px',borderRadius:'8px',boxShadow:'0 0 16px #a855f7aa'}} />
                </div>
              )}
              <button type="submit" className="btn neon modal-submit" disabled={editLoading}>{editLoading ? 'Updating...' : 'Update Event'}</button>
              {editError && <div style={{color:'#f87171',marginTop:'1rem'}}>{editError}</div>}
            </form>
            <button className="btn modal-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import { getEventDescription } from '../utils/eventUtils';
import EventCard from './EventCard';
import EventModal from './EventModal';

export default function EventsGrid({ 
  showDeleteConfirm, 
  setShowDeleteConfirm, 
  deleteLoading, 
  setDeleteLoading, 
  handleDeleteEvent, 
  confirmDelete,
  selectedEvent,
  setSelectedEvent,
  handleEditEvent,
  currentUser
}) {
  const [events, setEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await supabase.from('Events').select('*').order('date', { ascending: true });
      const { data, error } = res;
      if (error) {
        setError(error.message || JSON.stringify(error));
        setEvents([]);
      } else {
        setEvents(data || []);
      }
    } catch (err) {
      setError(err?.message || String(err));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    const handler = (e) => {
      const created = e?.detail;
      if (!created) return;
      setEvents(prev => [created, ...(prev || [])]);
    };
    window.addEventListener('event-created', handler);
    return () => window.removeEventListener('event-created', handler);
  }, []);

  const handleLoadMore = () => setVisibleCount(count => count + 6);
  const handleViewDetails = (event) => setSelectedEvent(event);
  const handleCloseModal = () => setSelectedEvent(null);

  const [attendLoading, setAttendLoading] = useState(false);
  const [isAttending, setIsAttending] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkAttend() {
      if (!selectedEvent || !currentUser) {
        if (mounted) setIsAttending(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('event_attendees')
          .select('id')
          .eq('event_id', String(selectedEvent.id))
          .eq('user_id', currentUser.id)
          .limit(1);
        if (error) {
          if (mounted) setIsAttending(false);
        } else {
          if (mounted) setIsAttending(Boolean(data && data.length > 0));
        }
      } catch (err) {
        if (mounted) setIsAttending(false);
      }
    }
    checkAttend();
    return () => { mounted = false; };
  }, [selectedEvent, currentUser]);

  async function handleToggleAttend(event) {
    if (!currentUser) {
      window.dispatchEvent(new CustomEvent('open-signin-modal'));
      return;
    }
    if (!event || !event.id) return;
    setAttendLoading(true);
    try {
      const currentCount = Number(event.attendees || 0);
      if (!isAttending) {
        setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, attendees: currentCount + 1 } : ev));
        setSelectedEvent(prev => prev ? { ...prev, attendees: currentCount + 1 } : prev);

        const { data: insData, error: insErr } = await supabase.from('event_attendees').insert([{ event_id: String(event.id), user_id: currentUser.id }]).select();
        if (insErr) {
          fetchEvents();
          alert('Failed to join event: ' + (insErr.message || JSON.stringify(insErr)));
          setAttendLoading(false);
          return;
        }

        const { error: updErr } = await supabase.from('Events').update({ attendees: currentCount + 1 }).eq('id', event.id);
        if (updErr) console.warn('Failed to update Events.attendees after insert', updErr);
        setIsAttending(true);
      } else {
        const newCount = Math.max(0, currentCount - 1);
        setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, attendees: newCount } : ev));
        setSelectedEvent(prev => prev ? { ...prev, attendees: newCount } : prev);

        const { error: delErr } = await supabase.from('event_attendees').delete().match({ event_id: String(event.id), user_id: currentUser.id });
        if (delErr) {
          fetchEvents();
          alert('Failed to leave event: ' + (delErr.message || JSON.stringify(delErr)));
          setAttendLoading(false);
          return;
        }

        const { error: updErr } = await supabase.from('Events').update({ attendees: newCount }).eq('id', event.id);
        if (updErr) console.warn('Failed to update Events.attendees after delete', updErr);
        setIsAttending(false);
      }
    } catch (err) {
      fetchEvents();
      alert('Failed to update attendance. Please try again.');
    }
    setAttendLoading(false);
    window.dispatchEvent(new CustomEvent('event-attendance-changed'));
  }

  function isSelectedEventOwner() {
    if (!currentUser || !selectedEvent) return false;
    try {
      const userId = String(currentUser.id || '');
      const evCreator = selectedEvent.creator_id ? String(selectedEvent.creator_id) : null;
      if (evCreator && userId && evCreator === userId) return true;
      const displayName = (currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.fullName || currentUser?.full_name || currentUser?.name || currentUser?.email || '').trim().toLowerCase();
      const artist = String(selectedEvent.artist || '').trim().toLowerCase();
      if (artist && (artist === displayName)) return true;
      if (artist && artist === (String(currentUser.email || '').trim().toLowerCase())) return true;
    } catch (e) {}
    return false;
  }

  function resolveImageField(image) {
    if (!image) return '';
    if (typeof image === 'string') return image;
    try {
      if (typeof image === 'object') {
        if (image.publicUrl) return image.publicUrl;
        if (image.url) return image.url;
        if (image.path) return image.path;
        if (image.Key) return `https://bjvptriklwrmcritiqcz.supabase.co/storage/v1/object/public/event-images/${image.Key}`;
        if (image?.metadata?.publicUrl) return image.metadata.publicUrl;
      }
      const maybe = JSON.parse(JSON.stringify(image));
      if (maybe && typeof maybe === 'object') {
        if (maybe.publicUrl) return maybe.publicUrl;
        if (maybe.url) return maybe.url;
        if (maybe.Key) return `https://bjvptriklwrmcritiqcz.supabase.co/storage/v1/object/public/event-images/${maybe.Key}`;
      }
    } catch (e) {
      console.warn('resolveImageField parse error', e);
    }
    return '';
  }

  if (loading) return <div className="events-grid"><p>Loading events...</p></div>;
  if (error) return (
    <div className="events-grid">
      <p style={{color: 'red'}}>Error loading events: {error}</p>
      <div style={{marginTop:'0.5rem'}}>
        <button className="btn" onClick={() => fetchEvents()}>Retry</button>
      </div>
    </div>
  );

  if (!loading && !error && events.length === 0) {
    const sampleEvents = [
      { id: 'sample-1', artist: 'Neon Pulse', venue: 'Crystal Club', date: '2025-09-10', time: '20:00', attendees: 120, image: '/Octocat.png', description: 'Sample event' },
      { id: 'sample-2', artist: 'Synthwave Collective', venue: 'Retro Dome', date: '2025-09-14', time: '21:30', attendees: 85, image: '/Octocat.png', description: 'Sample event' }
    ];
    return (
      <>
        <section className="events-grid">
          <div style={{padding:'0 1rem 1rem', color:'#cbd5e1'}}>
            No events returned from the server. Showing sample events for UI verification. Click "Retry" to fetch live data.
            <div style={{marginTop:'0.5rem'}}><button className="btn" onClick={() => fetchEvents()}>Retry</button></div>
          </div>
          {sampleEvents.map(event => (
            <EventCard key={event.id} event={event} imageSrc={event.image} onViewDetails={() => handleViewDetails(event)} />
          ))}
        </section>
      </>
    );
  }

  return (
    <>
      <section className="events-grid">
        {events.slice(0, visibleCount).map(event => (
          <EventCard key={event.id} event={event} imageSrc={resolveImageField(event.image)} onViewDetails={() => handleViewDetails(event)} />
        ))}
        {visibleCount < events.length && (
          <div className="load-more-container">
            <button className="btn neon" onClick={handleLoadMore}>Load More Events</button>
          </div>
        )}
      </section>
      {selectedEvent && (
        <EventModal
          selectedEvent={selectedEvent}
          onClose={handleCloseModal}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          currentUser={currentUser}
          isAttending={isAttending}
          attendLoading={attendLoading}
          onToggleAttend={handleToggleAttend}
          isOwner={isSelectedEventOwner()}
        />
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

import React from 'react';
import PropTypes from 'prop-types';
import { getEventDescription } from '../utils/eventUtils';

export default function EventModal({ selectedEvent, onClose, onEdit, onDelete, currentUser, isAttending, attendLoading, onToggleAttend, isOwner }) {
  if (!selectedEvent) return null;
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <img src={selectedEvent.image || '/Octocat.png'} alt={selectedEvent.artist} className="modal-img" />
        <h2>{selectedEvent.artist}</h2>
        <p><strong>Venue:</strong> {selectedEvent.venue}</p>
        <p><strong>Date:</strong> {selectedEvent.date}</p>
        <p><strong>Time:</strong> {selectedEvent.time}</p>
        <p><strong>Attendees:</strong> {selectedEvent.attendees}</p>
        <div className="modal-about">
          <h3>About this event</h3>
          <p>{getEventDescription(selectedEvent)}</p>
        </div>
        <div className="modal-actions">
          <div className="modal-actions-left">
            {isOwner ? (
              <>
                <button className="btn btn-edit" onClick={() => onEdit(selectedEvent)}>Edit</button>
                <button className="btn btn-delete" onClick={() => onDelete(selectedEvent)}>Delete</button>
              </>
            ) : (
              <div style={{color:'#cbd5e1', padding:'0.25rem 0.5rem'}}>Login to edit or delete</div>
            )}
          </div>
          <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
            {currentUser ? (
              <button
                className={`btn ${isAttending ? 'btn-attend-leave' : 'btn-attend-join'}`}
                onClick={() => onToggleAttend(selectedEvent)}
                disabled={attendLoading}
              >
                {attendLoading ? (isAttending ? 'Leaving...' : 'Joining...') : (isAttending ? 'Leave Event' : 'Attend Event')}
              </button>
            ) : (
              <button className="btn neon" onClick={() => window.dispatchEvent(new CustomEvent('open-join-modal'))}>
                Join to Attend
              </button>
            )}
            <button className="btn neon" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

EventModal.propTypes = {
  selectedEvent: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    artist: PropTypes.string,
    venue: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    attendees: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
  }),
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  isAttending: PropTypes.bool,
  attendLoading: PropTypes.bool,
  onToggleAttend: PropTypes.func.isRequired,
  isOwner: PropTypes.bool
};

EventModal.defaultProps = {
  selectedEvent: null,
  currentUser: null,
  isAttending: false,
  attendLoading: false,
  isOwner: false
};

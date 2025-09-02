import React from 'react';
import PropTypes from 'prop-types';

export default function EventCard({ event, imageSrc, onViewDetails }) {
  return (
    <div className="event-card" key={event.id}>
      <img src={imageSrc || '/Octocat.png'} alt={event.artist} className="event-img" />
      <div className="event-info">
        <h2 className="event-artist">{event.artist}</h2>
        <p className="event-venue">{event.venue}</p>
        <p className="event-date">{event.date} &bull; {event.time}</p>
        <p className="event-attendees">Attendees: {event.attendees}</p>
        <button className="btn neon event-action" onClick={onViewDetails}>View Details</button>
      </div>
    </div>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    artist: PropTypes.string,
    venue: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    attendees: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  imageSrc: PropTypes.string,
  onViewDetails: PropTypes.func.isRequired
};

EventCard.defaultProps = {
  imageSrc: '/Octocat.png'
};

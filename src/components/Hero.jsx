import React from 'react';

export default function Hero({ currentUser, onOpenCreate }) {
  const handleCTA = () => {
    if (currentUser) {
      if (typeof onOpenCreate === 'function') onOpenCreate();
    } else {
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-join-modal'));
    }
  };

  return (
    <section className="hero">
      <div className="hero-bg" />
      <h1 className="hero-title">
        <span className="gradient-text">Discover Live Music Events</span>
      </h1>
      <p className="hero-desc">
        Join the movement. Experience the future of live music.
      </p>
      <div style={{display:'flex', gap:'0.75rem', alignItems:'center', justifyContent:'center', marginTop:'1rem'}}>
        <button
          className="btn neon hero-cta"
          style={{width: '420px'}}
          onClick={handleCTA}
        >
          {currentUser ? 'Create Event' : 'Join Now'}
        </button>
      </div>
    </section>
  );
}

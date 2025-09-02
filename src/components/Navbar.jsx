import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Navbar({ onOpenCreate, onOpenLogin, onOpenJoin, currentUser, onLogout, isLoggingOut }) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const closeTimer = useRef(null);
  const displayName = currentUser ? (currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.fullName || currentUser?.full_name || currentUser?.name || currentUser?.email) : '';

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);
  return (
    <nav className="navbar">
      <div className="logo">
        <span className="logo-glow">ShowGo</span>
      </div>
      <ul className="nav-links">
        <li style={{cursor:'pointer'}} onClick={() => window.dispatchEvent(new CustomEvent('go-home'))}>Events</li>
        {currentUser && (
          <>
            <li className="create-event-link" onClick={onOpenCreate} style={{cursor:'pointer', color:'#a855f7'}}>Create Event</li>
            <li className="create-event-link" onClick={() => window.dispatchEvent(new CustomEvent('open-profile'))} style={{cursor:'pointer'}}>Profile</li>
          </>
        )}
      </ul>
      <div className="nav-actions">
        {currentUser ? (
          <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
            <button
              className="btn"
              onClick={() => { setOpen(false); onLogout(); }}
              disabled={isLoggingOut}
              title="Logout"
              style={{whiteSpace: 'nowrap'}}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
            <div style={{position:'relative'}}>
              <button
                ref={buttonRef}
                className="btn"
                onClick={() => {
                  if (open) setOpen(false);
                  else {
                    const rect = buttonRef.current?.getBoundingClientRect();
                    if (rect) setDropdownPos({ top: rect.bottom + 8 + window.scrollY, left: rect.left + window.scrollX });
                    setOpen(true);
                  }
                }}
                onMouseEnter={() => {
                  if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
                  const rect = buttonRef.current?.getBoundingClientRect();
                  if (rect) setDropdownPos({ top: rect.bottom + 8 + window.scrollY, left: rect.left + window.scrollX });
                  setOpen(true);
                }}
                onMouseLeave={() => {
                  closeTimer.current = setTimeout(() => setOpen(false), 150);
                }}
                title="Account options"
              >
                {displayName} <span style={{marginLeft:6}}>▾</span>
              </button>
              {open && buttonRef.current && createPortal(
                <div
                  onMouseEnter={() => {
                    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
                  }}
                  onMouseLeave={() => setOpen(false)}
                  style={{
                    position: 'absolute',
                    top: dropdownPos.top + 'px',
                    left: dropdownPos.left + 'px',
                    background: '#11121a',
                    border: '1px solid #2b2b33',
                    borderRadius: '8px',
                    padding: '0.25rem',
                    minWidth: '160px',
                    zIndex: 99999,
                    boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
                  }}
                >
                  <button className="btn" style={{width:'100%', textAlign:'left', background:'none', border:'none', color:'#a855f7', padding:'0.5rem'}} onClick={() => { window.dispatchEvent(new CustomEvent('open-profile')); setOpen(false); }}>Profile</button>
                </div>,
                document.body
              )}
            </div>
          </div>
        ) : (
          <button className="btn neon" onClick={onOpenLogin}>Login</button>
        )}
      </div>
    </nav>
  );
}

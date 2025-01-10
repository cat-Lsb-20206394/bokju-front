import React from 'react';
import { Link } from 'react-router-dom';

function BottomBar() {
  return (
    <footer
      style={{
        borderTop: '1px solid #ccc',
        padding: '1rem',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        background: '#fff',
      }}
    >
      <nav style={{ display: 'flex', justifyContent: 'center' }}>
        <Link to="/todo" style={{ marginRight: '2rem' }}>Todo</Link>
        <Link to="/schedule">Schedule</Link>
      </nav>
    </footer>
  );
}

export default BottomBar;

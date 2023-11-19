import React from 'react';
import './Asteroid.css';

const Asteroid = ({ x, y, velocity }) => {
  return (
    <div
      className="Asteroid"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        animation: `move ${velocity}s linear infinite`,
      }}
    ></div>
  );
};

export default Asteroid;

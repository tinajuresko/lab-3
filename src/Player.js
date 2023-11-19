import React from 'react';
import './Player.css';

const Player = ({ x, y }) => {
  return <div className="Player" style={{ left: `${x}px`, top: `${y}px` }}></div>;
};

export default Player;

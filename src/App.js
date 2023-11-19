import React, { useEffect, useState } from 'react';
import './App.css';
import Asteroid from './Asteroid';
import Player from './Player';

function App() {
  const [asteroids, setAsteroids] = useState([]); //polje asteroida (inicijalno prazno), i fja za updateanje asteroida
  const [playerPosition, setPlayerPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 }); //objekt s atributima x i y koord, i fja koja updatea poziciju igraca (inicijalna je na sredini ekrana)
  const [currentTime, setCurrentTime] = useState('00:00.000'); //stoperica na ekranu, inicijalno pocinje od nule
  const [bestTime, setBestTime] = useState(localStorage.getItem('bestTime') || '00:00.000'); //najbolje vrijeme koje se sprema u local storage
  //const [bestTimeMillisecondsValue, setBestTimeMillisecondsValue] = useState(localStorage.getItem('bestTime') || 0);
  const [startTime, setStartTime] = useState(null); //timestamp kad igra pocne, inicijalno null

  const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min; //fja za random brojeve

  /*const calculateMilliseconds = (formattedTime) => {
    const [minutes, seconds, milliseconds] = formattedTime.split(/[:.]/).map(Number);
    return minutes * 60 * 1000 + seconds * 1000 + milliseconds;
  };*/

  useEffect(() => { //ASTEROIDI
    const getRandomVelocity = () => getRandomNumber(5, 10); //random brzina asteroida
    const getRandomInterval = () => getRandomNumber(2000, 5000); //random interval dolaska novih asteroida

    const addAsteroid = () => { //stvaranje novih asteroida
      setAsteroids((prevAsteroids) => {
        const newAsteroid = {
          id: prevAsteroids.length,
          ...getRandomPosition(),
          velocity: getRandomVelocity(),
        };
        return [...prevAsteroids, newAsteroid];
      });
    };

    const asteroidInterval = setInterval(addAsteroid, getRandomInterval());

    return () => clearInterval(asteroidInterval);
  }, [asteroids]);

  const getRandomPosition = () => ({
    x: window.innerWidth + 30,
    y: getRandomNumber(0, window.innerHeight - 30),
  });

  const handleKeyPress = (event) => { //ovisno koja se tipka stisla dodajemo akcije + ogranicavamo igraca da ne moze nestat iz ekrana
    const playerSpeed = 10; 

    switch (event.key) {
      case 'ArrowUp':
        setPlayerPosition((prevPosition) => ({ ...prevPosition, y: Math.max(prevPosition.y - playerSpeed, 0) }));
        break;
      case 'ArrowDown':
        setPlayerPosition((prevPosition) => ({ ...prevPosition, y: Math.min(prevPosition.y + playerSpeed, window.innerHeight - 50) }));
        break;
      case 'ArrowLeft':
        setPlayerPosition((prevPosition) => ({ ...prevPosition, x: Math.max(prevPosition.x - playerSpeed, 0) }));
        break;
      case 'ArrowRight':
        setPlayerPosition((prevPosition) => ({ ...prevPosition, x: Math.min(prevPosition.x + playerSpeed, window.innerWidth - 50) }));
        break;
      default:
        break;
    }
  };

  useEffect(() => { //KOD ZA TIPKE
    window.addEventListener('keydown', handleKeyPress); //kad se stisne bilo koja tipka pozove se handlekeypress da vidimo sto ce se izvrsit

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []); //KRAJ KODA ZA TIPKE

  useEffect(() => { //KOLIZIJE I KRAJ IGRE
    const checkCollisions = () => {
      const playerRect = { x: playerPosition.x, y: playerPosition.y, width: 50, height: 50 };

      for (const asteroid of asteroids) {
        const asteroidRect = { x: asteroid.x - 25, y: asteroid.y - 25, width: 30, height: 30 };

        if (
          (playerRect.x <= asteroidRect.x + asteroidRect.width &&
            playerRect.x + playerRect.width >= asteroidRect.x) ||
          (playerRect.y <= asteroidRect.y + asteroidRect.height &&
            playerRect.y + playerRect.height >= asteroidRect.y)
        ) {
          console.log('Collision detected! Game over!');
          handleGameOver();
          clearInterval(gameInterval);
          return;
        }
      }
    };

    const handleGameOver = () => { 
      console.log('Game Over!');
      const elapsedTime = performance.now() - startTime; //proteklo vrijeme
      //formatiramo ga u mm:ss.SSS za provjeru s onim u localstorageu
        const elapsedMinutes = Math.floor(elapsedTime / 60000);
        const elapsedSeconds = Math.floor((elapsedTime % 60000) / 1000);
        const elapsedMillisecondsRemainder = Math.floor(elapsedTime % 1000);
        const formattedBestTime = `${elapsedMinutes.toString().padStart(2, '0')}:${elapsedSeconds.toString().padStart(2, '0')}.${elapsedMillisecondsRemainder.toString().padStart(3, '0')}`;
        const storedBestTime = localStorage.getItem('bestTime') || '00:00.000';

        if(formattedBestTime > storedBestTime){ //ako je veci od najboljeg onda updateamo localstorage
          setBestTime(formattedBestTime);
          localStorage.setItem('bestTime', formattedBestTime);
        }

       
      

      setAsteroids([]);
      setPlayerPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setStartTime(null);

      const restartGame = window.confirm('Game Over!');
      if (restartGame) {
        startGame();
      }
    };

    const gameLoop = () => { //igra je zapravo loop provjere kolizija
      checkCollisions();
      requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
      setStartTime(performance.now());
      gameLoop();
    };

    const gameInterval = setInterval(startGame, 1000 / 60);

    return () => {
      setStartTime(null);
      clearInterval(gameInterval);
    };
  }, [asteroids, playerPosition, currentTime, bestTime]); //KRAJ KOLIZIJA I KRAJA IGRE

  useEffect(() => { //KOD ZA ŠTOPERICU
    let intervalId;
    let startTimestamp;

    const updateCurrentTime = () => { 
      if (startTimestamp) {
        const currentTimestamp = performance.now();
        const elapsedMilliseconds = currentTimestamp - startTimestamp; 
        //pretvorbe za zadani format
        const elapsedMinutes = Math.floor(elapsedMilliseconds / 60000);
        const elapsedSeconds = Math.floor((elapsedMilliseconds % 60000) / 1000);
        const elapsedMillisecondsRemainder = Math.floor(elapsedMilliseconds % 1000);

        const formattedTime = `${elapsedMinutes.toString().padStart(2, '0')}:${elapsedSeconds //Zadani format mm:ss.SSS
          .toString()
          .padStart(2, '0')}.${elapsedMillisecondsRemainder.toString().padStart(3, '0')}`;
        setCurrentTime(formattedTime);
      }
    };

    startTimestamp = performance.now();
    intervalId = setInterval(updateCurrentTime, 16);

    return () => {
      clearInterval(intervalId);
    };
  }, []); //KRAJ KODA ZA STOPERICU

  return (
    <div className="App">
      <div>
        <strong>Current Time: </strong>
        {currentTime}
      </div>
      <div>
        <strong>Best Time: </strong>
        {bestTime}
      </div>
      <canvas id="gameCanvas" width={window.innerWidth} height={window.innerHeight}></canvas>
      {asteroids.map((asteroid) => (
        <Asteroid key={asteroid.id} x={asteroid.x} y={asteroid.y} velocity={asteroid.velocity} />
      ))}
      <Player x={playerPosition.x} y={playerPosition.y} />
    </div>
  );
}

export default App;

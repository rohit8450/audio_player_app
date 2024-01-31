import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const savedPlaylist = JSON.parse(localStorage.getItem('playlist')) || [];
    const savedTrackIndex = JSON.parse(localStorage.getItem('currentTrackIndex'));

    if (savedTrackIndex !== null && savedPlaylist.length > 0) {
      setCurrentTrack(savedPlaylist[savedTrackIndex]);
      setPlaylist(savedPlaylist);
    }
  }, []);

  useEffect(() => {
    if (currentTrack) {
      // Use Blob to create an object URL
      const audioBlob = new Blob([currentTrack]);
      const audioObjectURL = URL.createObjectURL(audioBlob);
      
      audioRef.current.src = audioObjectURL;
      audioRef.current.currentTime = 0; // Start from the beginning
      audioRef.current.play();
    }
  }, [currentTrack]);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const newPlaylist = [...playlist, ...files];
      setPlaylist(newPlaylist);
      setCurrentTrack(newPlaylist[newPlaylist.length - 1]);

      // Store playlist and current track in localStorage
      localStorage.setItem('playlist', JSON.stringify(newPlaylist));
      localStorage.setItem('currentTrackIndex', JSON.stringify(newPlaylist.length - 1));
    }
  };

  const handlePlay = () => {
  if (audioRef.current) {
    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {})
        .catch((error) => {
          // Autoplay was prevented, possibly due to user interaction requirement
          console.error('Autoplay prevented:', error);

          // Unmute and try playing again after user interaction
          audioRef.current.muted = false;
          document.addEventListener('click', handleAutoplayAfterInteraction, { once: true });
        });
    }
  }
};

const handleAutoplayAfterInteraction = () => {
  audioRef.current.play()
    .then(() => {})
    .catch((error) => {
      console.error('Failed to play audio after user interaction:', error);
    });
};

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleDelete = (index) => {
    const updatedPlaylist = [...playlist];
    updatedPlaylist.splice(index, 1);

    if (index === playlist.indexOf(currentTrack)) {
      setCurrentTrack(null);
    }

    setPlaylist(updatedPlaylist);
    localStorage.setItem('playlist', JSON.stringify(updatedPlaylist));
  };

  const handleEnded = () => {
    const currentIndex = playlist.indexOf(currentTrack);
    if (currentIndex < playlist.length - 1) {
      setCurrentTrack(playlist[currentIndex + 1]);
    }
  };

  return (
    <div className="container">
      <h1>Audio Player</h1>
      <input type="file" accept=".mp3" onChange={handleFileChange} />
      {currentTrack && (
        <div className="now-playing">
          <h2>Now Playing: {currentTrack.name}</h2>
          <audio
            ref={audioRef}
            controls
            onEnded={handleEnded}
            onTimeUpdate={() => {
              // Store the current playback position in localStorage
              localStorage.setItem('audioPosition', audioRef.current.currentTime);
            }}
          >
            {/* Source tag is not needed here */}
          </audio>
          <button onClick={handlePlay}>Play</button>
          <button onClick={handlePause}>Pause</button>
        </div>
      )}
      <div className="playlist">
        <h2>Playlist</h2>
        <ul>
          {playlist.map((track, index) => (
            <li key={index}>
              <button className="play-btn" onClick={() => setCurrentTrack(track)}>
                {track.name}
              </button>
              <button className="delete-btn"onClick={() => handleDelete(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
     
    </div>
  );
}

export default App;

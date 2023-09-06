import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlaybackState, Track } from '@spotify/web-api-ts-sdk';
import { AuthorizeUser } from './Authorize';

const reAuthorizeUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.search = '';
  AuthorizeUser();
};

const fetchProfile = async (): Promise<any> => {
  const token = localStorage.getItem('access_token');
  const result = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (result.status === 401 && localStorage.getItem('access_token')) {
    reAuthorizeUser();
  }

  return await result.json();
};

const fetchPlayer = async (): Promise<any> => {
  const token = localStorage.getItem('access_token');
  const result = await fetch(
    'https://api.spotify.com/v1/me/player?type=episode,track',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (result.status === 401 && localStorage.getItem('access_token')) {
    reAuthorizeUser();
  }

  if (result.ok) {
    return await result.json();
  }

  return null;
};

const Player = () => {
  const [username, setUserName] = useState('');
  const [songProgress, setSongProgress] = useState<number>(0);
  const [songProgressMs, setSongProgressMs] = useState<number>(0);

  const { data, error, isLoading } = useQuery(['trackData'], fetchPlayer, {
    refetchInterval: 15000,
  });

  const getToken = async () => {
    AuthorizeUser();
    const profile = await fetchProfile();
    setUserName(profile.display_name);
  };

  useEffect(() => {
    getToken();
  }, []);

  if (isLoading) {
    return <></>;
  }

  const playerData: PlaybackState = data;

  let track: Track | null = null;

  if (playerData) {
    if (playerData.is_playing) {
      track = playerData.item as Track;
    }
  }

  const getSongProgress = () => {
    if (track) {
      const track: Track = playerData.item as Track;
      const currentTime = new Date().getTime();
      const estimateEnd = new Date(
        playerData.timestamp + track.duration_ms
      ).getTime();
      const elapsedMilliseconds =
        track.duration_ms - (estimateEnd - currentTime);
      const milliseconds = Math.max(elapsedMilliseconds, 0);
      return Math.round(
        Math.min((milliseconds / track.duration_ms) * 100, 100)
      );
    }
    return 0;
  };

  const getSongProgressInMilliseconds = () => {
    if (track) {
      const track: Track = playerData.item as Track;
      const currentTime = new Date().getTime();
      const estimateEnd = new Date(
        playerData.timestamp + track.duration_ms
      ).getTime();
      return Math.min(
        track.duration_ms - (estimateEnd - currentTime),
        track.duration_ms
      );
    }
    return 0;
  };

  setTimeout(() => {
    setSongProgress(getSongProgress());
    setSongProgressMs(getSongProgressInMilliseconds());
  }, 1000);

  const cleanTime = (time: number) => {
    const date = new Date(time);
    let options: Intl.DateTimeFormatOptions = {
      minute: '2-digit',
      second: '2-digit',
    };
    const numbers = date.toLocaleTimeString('fi-fi', options).split('.');
    const timeStr = numbers.join(':');
    return timeStr;
  };

  if (track === null) {
    return (
      <div className="nothing-container">
        <h1>Nothing is playing</h1>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignSelf: 'flex-start' }}>
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <img
            className="album-cover"
            width="80"
            alt="icon"
            src={track.album.images[0].url}
          />

          <div style={{ flexDirection: 'column', padding: 16 }}>
            <p className="track-title">{track.name}</p>
            <p className="track-artist">{track.artists[0].name}</p>
            <div
              style={{
                flexDirection: 'row',
                display: 'flex',
                alignItems: 'center',
                marginTop: '1rem',
              }}
            >
              <p
                className="track-time"
                style={{ margin: 0, marginRight: '0.5rem' }}
              >
                {cleanTime(songProgressMs)}
              </p>
              <div className="track-progress">
                <div
                  style={{
                    width: `${songProgress}%`,
                  }}
                ></div>
              </div>
              <p className="track-time">{cleanTime(track.duration_ms)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Player />} />
      </Routes>
    </Router>
  );
}

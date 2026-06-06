import { useState, useEffect, useRef } from 'react';

export const useAudio = (url: string) => {
  const audio = useRef(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    playing ? audio.current?.play() : audio.current.pause();
  }, [playing]);

  useEffect(() => {
    // Optional: loop the music
    audio.current.loop = true;
    return () => {
      audio.current.pause();
    };
  }, []);

  return { playing, toggle };
};
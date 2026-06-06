import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";

export default function MusicPlayer() {
  // Pass the path as a string.
  // "/music.mp3" tells the browser to look in your 'public' folder.
  const { playing, toggle } = useAudio("/music.mp3");

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 left-6 rtl:right-6 z-[9999] p-3 bg-pacta-navy text-pacta-gold rounded-full shadow-xl border border-pacta-gold/20 hover:scale-110 transition-transform"
    >
      {playing ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}

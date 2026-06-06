import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import music from "../../public/music.mp3";
export default function MusicPlayer() {
  const { playing, toggle } = useAudio(music); // Path to your file in /public folder

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 left-6 z-[9999] p-3 bg-pacta-navy text-pacta-gold rounded-full shadow-xl border border-pacta-gold/20 hover:scale-110 transition-transform"
    >
      {playing ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}

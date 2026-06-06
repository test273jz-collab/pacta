export default function MusicPlayer() {
  const { playing, toggle } = useAudio("/music.mp3");

  return (
    <button
      onClick={toggle}
      // 'start-6' will be the left in LTR and the right in RTL
      // 'end-6' will be the right in LTR and the left in RTL
      className="fixed bottom-6 start-6 z-[9999] p-3 bg-pacta-navy text-pacta-gold rounded-full shadow-xl border border-pacta-gold/20 hover:scale-110 transition-transform"
    >
      {playing ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}

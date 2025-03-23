import useSound from "use-sound";

const SOUND_PATHS: Record<"error" | "send" | "micStart" | "micDown", string> = {
  error: "/sounds/error.mp3",
  send: "/sounds/send.mp3",
  micStart: "/sounds/mic-start.mp3",
  micDown: "/sounds/mic-down.mp3",
};

export function useAppSound() {
  const [playError] = useSound(SOUND_PATHS.error);
  const [playSend] = useSound(SOUND_PATHS.send);
  const [playMicStart] = useSound(SOUND_PATHS.micStart);
  const [playMicDown] = useSound(SOUND_PATHS.micDown);

  return {
    playError,
    playSend,
    playMicStart,
    playMicDown,
  };
}

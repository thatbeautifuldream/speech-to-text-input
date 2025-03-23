import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSpeechStore } from "@/store/use-speech-store";
import { useSpeechRecognition } from "./use-speech-recognition";
import { useAppSound } from "./use-app-sound";

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const selectedVoice = useSpeechStore((state) => state.selectedVoice);
  const { playError } = useAppSound();

  // use the useSpeechRecognition hook and put the mic down when the user selects the speak button
  const { handleMicrophoneStop } = useSpeechRecognition();

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text: string) => {
    if (!text.trim()) {
      playError();
      toast.error("Please enter some text to speak");
      return;
    }

    // Stop any ongoing speech and microphone
    window.speechSynthesis.cancel();
    handleMicrophoneStop();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Set the selected voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error", event);
      setIsSpeaking(false);
      playError();
      toast.error("Error speaking text");
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return {
    isSpeaking,
    speakText,
  };
}

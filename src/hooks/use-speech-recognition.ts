import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSpeechStore } from "@/store/use-speech-store";
import {
  SpeechRecognition,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
} from "@/types/speech";

export function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");
  const micStartSoundRef = useRef<HTMLAudioElement | null>(null);
  const micStopSoundRef = useRef<HTMLAudioElement | null>(null);

  const {
    setInterimTranscript,
    setListening,
    setSupported,
    setLoading,
    updateFinalTranscript,
    isSupported,
    isListening,
  } = useSpeechStore();

  // Centralized function to handle microphone stop
  const handleMicrophoneStop = () => {
    setListening(false);
    setInterimTranscript("");
    setLoading(false);
    // Play mic stop sound
    micStopSoundRef.current?.play().catch(console.error);
  };

  useEffect(() => {
    // Initialize audio elements
    micStartSoundRef.current = new Audio("/sounds/mic-start.mp3");
    micStopSoundRef.current = new Audio("/sounds/mic-down.mp3");

    return () => {
      // Cleanup audio elements
      if (micStartSoundRef.current) {
        micStartSoundRef.current = null;
      }
      if (micStopSoundRef.current) {
        micStopSoundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setSupported(false);
      return;
    }

    // Initialize SpeechRecognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    const handleStart = () => {
      setLoading(false);
      setListening(true);
      setInterimTranscript("");
      // Play mic start sound
      micStartSoundRef.current?.play().catch(console.error);
    };

    const handleEnd = () => {
      handleMicrophoneStop();
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      handleMicrophoneStop();
      toast.error(`Speech recognition error: ${event.error}`);
    };

    const handleResult = (event: SpeechRecognitionEvent) => {
      let currentInterimTranscript = "";
      let newFinalTranscript = "";

      // Process results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          newFinalTranscript += transcriptText + " ";
        } else {
          currentInterimTranscript += transcriptText;
        }
      }

      // Update final transcript if we have new final results
      if (newFinalTranscript) {
        finalTranscriptRef.current += newFinalTranscript;
        updateFinalTranscript(newFinalTranscript);
      }

      // Update interim transcript
      setInterimTranscript(currentInterimTranscript);
    };

    // Attach event listeners
    recognitionRef.current.onstart = handleStart;
    recognitionRef.current.onend = handleEnd;
    recognitionRef.current.onerror = handleError;
    recognitionRef.current.onresult = handleResult;

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.onstart = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
        } catch (error) {
          console.error("Error during speech recognition cleanup:", error);
        }
      }
    };
  }, [
    setSupported,
    setLoading,
    setListening,
    setInterimTranscript,
    updateFinalTranscript,
  ]);

  const toggleListening = async (transcript: string) => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      handleMicrophoneStop();
    } else {
      try {
        setLoading(true);
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        // Reset the final transcript reference when starting a new session
        if (!transcript) {
          finalTranscriptRef.current = "";
        }
        recognitionRef.current?.start();
      } catch (error) {
        console.error("Error accessing microphone", error);
        handleMicrophoneStop();
        toast.error("Microphone access is required for speech recognition.");
      }
    }
  };

  return {
    toggleListening,
    handleMicrophoneStop,
    finalTranscriptRef,
    recognitionRef,
  };
}

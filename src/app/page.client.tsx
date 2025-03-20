"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechStore } from "@/store/use-speech-store";
import { Loader2, Mic, MicOff, Volume2, VolumeX, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMessagesStore } from "@/store/use-messages-store";
import { MessagesList } from "@/components/messages-list";

type SpeechRecognitionErrorEvent = Event & {
  error: string;
};

type SpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
};

type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: {
    [index: number]: SpeechRecognitionResult;
    length: number;
  };
};

type SpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
};

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

type TSpeechToTextProps = {
  className?: string;
};

export default function SpeechToText({ className }: TSpeechToTextProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Use selective state updates to prevent unnecessary re-renders
  const transcript = useSpeechStore((state) => state.transcript);
  const interimTranscript = useSpeechStore((state) => state.interimTranscript);
  const isListening = useSpeechStore((state) => state.isListening);
  const isSupported = useSpeechStore((state) => state.isSupported);
  const isLoading = useSpeechStore((state) => state.isLoading);

  // Actions
  const setTranscript = useSpeechStore((state) => state.setTranscript);
  const setInterimTranscript = useSpeechStore(
    (state) => state.setInterimTranscript
  );
  const setListening = useSpeechStore((state) => state.setListening);
  const setSupported = useSpeechStore((state) => state.setSupported);
  const setLoading = useSpeechStore((state) => state.setLoading);
  const resetTranscript = useSpeechStore((state) => state.resetTranscript);
  const updateFinalTranscript = useSpeechStore(
    (state) => state.updateFinalTranscript
  );

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");
  const addMessage = useMessagesStore((state) => state.addMessage);

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
    };

    const handleEnd = () => {
      setListening(false);
      setInterimTranscript("");
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      setListening(false);
      setLoading(false);
      setInterimTranscript("");
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

  const toggleListening = async () => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
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
        setLoading(false);
        toast.error("Microphone access is required for speech recognition.");
      }
    }
  };

  const speakText = () => {
    if (!transcript && !interimTranscript) {
      toast.error("Please enter some text to speak");
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    // Stop microphone recording if it's active
    if (isListening) {
      recognitionRef.current?.stop();
    }

    const utterance = new SpeechSynthesisUtterance(
      transcript + (interimTranscript ? ` ${interimTranscript}` : "")
    );

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error", event);
      setIsSpeaking(false);
      toast.error("Error speaking text");
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Add cleanup for speech synthesis
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSend = () => {
    const text =
      transcript + (interimTranscript ? ` ${interimTranscript}` : "");
    if (!text.trim()) {
      toast.error("Please enter some text to send");
      return;
    }

    // Stop microphone recording if it's active
    if (isListening) {
      recognitionRef.current?.stop();
    }

    addMessage(text.trim());
    resetTranscript();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto space-y-4", className)}>
      <div className="relative">
        <Textarea
          value={
            transcript + (interimTranscript ? ` ${interimTranscript}` : "")
          }
          onChange={(e) => {
            setTranscript(e.target.value);
            finalTranscriptRef.current = e.target.value;
          }}
          onKeyDown={handleKeyDown}
          placeholder="Click the microphone button and start speaking..."
          className="min-h-[150px] pr-36 resize-y"
        />
        <AnimatePresence mode="wait">
          <div className="absolute bottom-3 right-3 flex gap-2">
            <motion.div initial={{ scale: 1 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={speakText}
                size="icon"
                variant={isSpeaking ? "destructive" : "secondary"}
                className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                aria-label={isSpeaking ? "Stop speaking" : "Speak text"}
              >
                {isSpeaking ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
            <motion.div initial={{ scale: 1 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={toggleListening}
                disabled={!isSupported || isLoading}
                size="icon"
                variant={isListening ? "destructive" : "default"}
                className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isListening && (
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 0.2, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          backgroundColor: "var(--destructive)",
                          borderRadius: "inherit",
                        }}
                      />
                    )}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="relative z-10 flex items-center justify-center w-full h-full"
                    >
                      {isListening ? (
                        <MicOff className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </motion.div>
                  </>
                )}
              </Button>
            </motion.div>
            <motion.div initial={{ scale: 1 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSend}
                size="icon"
                variant="default"
                className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </AnimatePresence>
      </div>

      {!isSupported && (
        <p className="text-sm text-muted-foreground">
          Speech recognition is not supported in your browser. Try using Chrome,
          Edge, or Safari.
        </p>
      )}

      <MessagesList />
    </div>
  );
}

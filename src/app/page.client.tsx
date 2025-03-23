"use client";

import { MessagesList } from "@/components/messages-list";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceSelector } from "@/components/voice-selector";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { cn } from "@/lib/utils";
import { useMessagesStore } from "@/store/use-messages-store";
import { useSpeechStore } from "@/store/use-speech-store";
import { SpeechRecognition } from "@/types/speech";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { useEffect } from "react";
import { useAppSound } from "@/hooks/use-app-sound";

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function SpeechToText({ className }: { className?: string }) {
  // Use selective state updates to prevent unnecessary re-renders
  const transcript = useSpeechStore((state) => state.transcript);
  const interimTranscript = useSpeechStore((state) => state.interimTranscript);
  const isListening = useSpeechStore((state) => state.isListening);
  const isSupported = useSpeechStore((state) => state.isSupported);
  const isLoading = useSpeechStore((state) => state.isLoading);
  const setTranscript = useSpeechStore((state) => state.setTranscript);
  const resetTranscript = useSpeechStore((state) => state.resetTranscript);

  const addMessage = useMessagesStore((state) => state.addMessage);

  const {
    toggleListening,
    handleMicrophoneStop,
    finalTranscriptRef,
    recognitionRef,
  } = useSpeechRecognition();
  const { isSpeaking, speakText } = useSpeechSynthesis();
  const { playSend } = useAppSound();

  const handleSend = () => {
    const text =
      transcript + (interimTranscript ? ` ${interimTranscript}` : "");
    console.log("📤 Sending message:", { text, transcript, interimTranscript });

    if (!text.trim()) {
      return;
    }

    // Add the message first
    addMessage(text.trim());
    playSend();

    // Stop microphone recording if it's active and handle cleanup
    if (isListening && recognitionRef.current) {
      console.log("🎤 Stopping recognition on send");
      // First stop the recognition
      recognitionRef.current.stop();
      handleMicrophoneStop();

      // Use a small timeout to ensure recognition has fully stopped
      setTimeout(() => {
        console.log("🧹 Cleaning up after send");
        resetTranscript();
        finalTranscriptRef.current = "";
      }, 100);
    } else {
      // If not listening, just reset immediately
      console.log("🧹 Immediate cleanup after send");
      resetTranscript();
      finalTranscriptRef.current = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      console.log("⌨️ Enter pressed - sending message");
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeakClick = () => {
    console.log("🔊 Speaking text:", {
      transcript,
      interimTranscript,
      fullText: transcript + (interimTranscript ? ` ${interimTranscript}` : ""),
    });
    speakText(transcript + (interimTranscript ? ` ${interimTranscript}` : ""));
  };

  useEffect(() => {
    console.log("🔄 State Update:", {
      transcript,
      interimTranscript,
      isListening,
      isSupported,
      isLoading,
    });
  }, [transcript, interimTranscript, isListening, isSupported, isLoading]);

  return (
    <div className={cn("w-full space-y-4 px-4 py-6", className)}>
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
        <div className="absolute bottom-3 left-3">
          <VoiceSelector />
        </div>
        <AnimatePresence mode="wait">
          <div className="absolute bottom-3 right-3 flex gap-2">
            <motion.div initial={{ scale: 1 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSpeakClick}
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
                onClick={() => toggleListening(transcript)}
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

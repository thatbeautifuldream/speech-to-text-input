"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechStore } from "@/store/use-speech-store";
import { Loader2, Mic, MicOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type TSpeechToTextProps = {
  className?: string;
};

export default function SpeechToText({ className }: TSpeechToTextProps) {
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

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

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

    const handleError = (event: any) => {
      console.error("Speech recognition error", event.error);
      setListening(false);
      setLoading(false);
      setInterimTranscript("");
      toast.error(`Speech recognition error: ${event.error}`);
    };

    const handleResult = (event: any) => {
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
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
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
      recognitionRef.current.stop();
    } else {
      try {
        setLoading(true);
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        // Reset the final transcript reference when starting a new session
        if (!transcript) {
          finalTranscriptRef.current = "";
        }
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error accessing microphone", error);
        setLoading(false);
        toast.error("Microphone access is required for speech recognition.");
      }
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto space-y-4", className)}>
      <div className="relative">
        <Textarea
          value={
            transcript + (interimTranscript ? ` ${interimTranscript}` : "")
          }
          onChange={(e) => {
            setTranscript(e.target.value);
            finalTranscriptRef.current = e.target.value;
          }}
          placeholder="Click the microphone button and start speaking..."
          className="min-h-[150px] pr-12 resize-y"
        />
        <AnimatePresence mode="wait">
          <motion.div
            className="absolute bottom-3 right-3"
            initial={{ scale: 1 }}
            whileTap={{ scale: 0.95 }}
          >
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
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative z-10 flex items-center justify-center w-full h-full"
                  >
                    {isListening ? (
                      <MicOff className="h-5 w-5 text-white" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </motion.div>
                </>
              )}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {!isSupported && (
        <p className="text-sm text-muted-foreground">
          Speech recognition is not supported in your browser. Try using Chrome,
          Edge, or Safari.
        </p>
      )}

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={resetTranscript}
          disabled={!transcript}
          size="sm"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

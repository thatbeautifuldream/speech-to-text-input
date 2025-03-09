import { create } from "zustand";
import { devtools } from "zustand/middleware";

type TSpeechState = {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  isLoading: boolean;
};

type TSpeechActions = {
  setTranscript: (transcript: string) => void;
  setInterimTranscript: (transcript: string) => void;
  setListening: (isListening: boolean) => void;
  setSupported: (isSupported: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  resetTranscript: () => void;
  updateFinalTranscript: (newTranscript: string) => void;
};

// Define and export the store type
export type TSpeechStore = TSpeechState & TSpeechActions;

// Create the store with devtools middleware for better debugging
export const useSpeechStore = create<TSpeechStore>()(
  devtools(
    (set) => ({
      // Initial state
      transcript: "",
      interimTranscript: "",
      isListening: false,
      isSupported: true,
      isLoading: false,

      // Actions
      setTranscript: (transcript) =>
        set({ transcript }, false, "setTranscript"),

      setInterimTranscript: (interimTranscript) =>
        set({ interimTranscript }, false, "setInterimTranscript"),

      setListening: (isListening) =>
        set({ isListening }, false, "setListening"),

      setSupported: (isSupported) =>
        set({ isSupported }, false, "setSupported"),

      setLoading: (isLoading) => set({ isLoading }, false, "setLoading"),

      resetTranscript: () =>
        set(
          { transcript: "", interimTranscript: "" },
          false,
          "resetTranscript"
        ),

      updateFinalTranscript: (newTranscript) =>
        set(
          (state) => ({
            transcript: (state.transcript + " " + newTranscript).trim(),
          }),
          false,
          "updateFinalTranscript"
        ),
    }),
    { name: "speech-store" }
  )
);

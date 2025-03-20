import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface SpeechStore {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  isLoading: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  // Actions
  setTranscript: (transcript: string) => void;
  setInterimTranscript: (interimTranscript: string) => void;
  setListening: (isListening: boolean) => void;
  setSupported: (isSupported: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  resetTranscript: () => void;
  updateFinalTranscript: (newText: string) => void;
  setVoices: (voices: SpeechSynthesisVoice[]) => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
}

// Define and export the store type
export type TSpeechStore = SpeechStore;

// Create the store with devtools middleware for better debugging
export const useSpeechStore = create<SpeechStore>()(
  devtools(
    (set) => ({
      // Initial state
      transcript: "",
      interimTranscript: "",
      isListening: false,
      isSupported: true,
      isLoading: false,
      voices: [],
      selectedVoice: null,

      // Actions
      setTranscript: (transcript) => set({ transcript }),

      setInterimTranscript: (interimTranscript) => set({ interimTranscript }),

      setListening: (isListening) => set({ isListening }),

      setSupported: (isSupported) => set({ isSupported }),

      setLoading: (isLoading) => set({ isLoading }),

      resetTranscript: () => set({ transcript: "", interimTranscript: "" }),

      updateFinalTranscript: (newText) =>
        set((state) => ({ transcript: state.transcript + newText })),

      setVoices: (voices) => set({ voices }),

      setSelectedVoice: (voice) => set({ selectedVoice: voice }),
    }),
    { name: "speech-store" }
  )
);

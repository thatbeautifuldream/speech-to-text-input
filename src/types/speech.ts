export type SpeechRecognitionErrorEvent = Event & {
  error: string;
};

export type SpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
};

export type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: {
    [index: number]: SpeechRecognitionResult;
    length: number;
  };
};

export type SpeechRecognition = EventTarget & {
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

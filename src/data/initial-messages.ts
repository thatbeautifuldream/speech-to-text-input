import { Message } from "../store/use-messages-store";

export const initialMessages: Message[] = [
  {
    id: "welcome-message",
    text: "And you know what's more interesting? This project is open source.",
    timestamp: 1742504353047,
  },
  {
    id: "opensource-message",
    text: "Welcome to Speech Notes! This is a fun project to explore the Web Speech API. Simply click the microphone button and start speaking and your words will be converted to text in real-time. You can select your preferred language from a list of languages in the dropdown above. Click the speaker icon next to any message to have it read aloud. You can edit, delete, or clear your notes anytime.",
    timestamp: 1742504362977,
  },
];

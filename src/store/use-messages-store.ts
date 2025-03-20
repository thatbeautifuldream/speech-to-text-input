import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Message = {
  id: string;
  text: string;
  timestamp: number;
};

type MessagesStore = {
  messages: Message[];
  addMessage: (text: string) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
};

export const useMessagesStore = create<MessagesStore>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (text) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: crypto.randomUUID(),
              text,
              timestamp: Date.now(),
            },
          ],
        })),
      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "messages-storage",
    }
  )
);

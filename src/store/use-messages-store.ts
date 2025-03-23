import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialMessages } from "@/data/initial-messages";

export type TMessage = {
  id: string;
  text: string;
  timestamp: number;
};

type MessagesStore = {
  messages: TMessage[];
  addMessage: (text: string) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
};

export const useMessagesStore = create<MessagesStore>()(
  persist(
    (set, get) => ({
      messages: initialMessages,
      addMessage: (text) => {
        const newMessage = {
          id: crypto.randomUUID(),
          text,
          timestamp: Date.now(),
        };
        set({ messages: [...get().messages, newMessage] });
      },
      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "messages-storage",
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // Handle migration from version 0 to 1
          return {
            ...(persistedState as MessagesStore),
            messages: (persistedState as MessagesStore).messages || [],
          };
        }
        return persistedState as MessagesStore;
      },
    }
  )
);

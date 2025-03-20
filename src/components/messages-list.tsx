import { useState, Fragment } from "react";
import { Button } from "./ui/button";
import { Volume2, VolumeX, Trash2 } from "lucide-react";
import { useMessagesStore } from "@/store/use-messages-store";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function MessagesList() {
  const messages = useMessagesStore((state) => state.messages);
  const deleteMessage = useMessagesStore((state) => state.deleteMessage);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const speakMessage = (id: string, text: string) => {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error", event);
      setSpeakingId(null);
      toast.error("Error speaking text");
    };

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4 mt-8">
      {messages.map((message) => (
        <Fragment key={message.id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border bg-card text-card-foreground shadow-sm relative group"
          >
            <p className="pr-20">{message.text}</p>
            <div className="absolute right-2 top-2 flex items-center gap-2">
              <Button
                onClick={() => deleteMessage(message.id)}
                size="icon"
                variant="ghost"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => speakMessage(message.id, message.text)}
                size="icon"
                variant={
                  speakingId === message.id ? "destructive" : "secondary"
                }
                className="h-8 w-8 rounded-full"
              >
                {speakingId === message.id ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>
          <div className="flex justify-end">
            <time className="text-xs text-muted-foreground mr-1">
              {new Date(message.timestamp).toLocaleString()}
            </time>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

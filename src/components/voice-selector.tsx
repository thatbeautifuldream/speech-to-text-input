"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSpeechStore } from "@/store/use-speech-store";

// Helper function to get language name from locale
const getLanguageName = (locale: string) => {
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "language" }).of(
        locale.split("-")[0]
      ) || locale
    );
  } catch (e) {
    console.log(
      "🪵 [voice-selector.tsx:31] ~ token ~ \x1b[0;32me\x1b[0m = ",
      e
    );
    return locale;
  }
};

// Group voices by language
const groupVoicesByLanguage = (voices: SpeechSynthesisVoice[]) => {
  const groups = voices.reduce((acc, voice) => {
    const lang = voice.lang.split("-")[0];
    console.log(
      "🪵 [voice-selector.tsx:39] ~ token ~ \x1b[0;32mlang\x1b[0m = ",
      lang
    );
    const langName = getLanguageName(voice.lang);
    if (!acc[langName]) {
      acc[langName] = [];
    }
    acc[langName].push(voice);
    return acc;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

  // Sort languages alphabetically
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
};

export function VoiceSelector() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const voices = useSpeechStore((state) => state.voices);
  const selectedVoice = useSpeechStore((state) => state.selectedVoice);
  const setSelectedVoice = useSpeechStore((state) => state.setSelectedVoice);
  const setVoices = useSpeechStore((state) => state.setVoices);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    // Initialize voices
    const loadVoices = () => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Set default voice if none selected
      if (availableVoices.length > 0 && !selectedVoice) {
        // Try to find an English voice first
        const defaultVoice =
          availableVoices.find((v) => v.lang.startsWith("en-")) ||
          availableVoices[0];
        setSelectedVoice(defaultVoice);
      }
    };

    loadVoices();

    // Chrome loads voices asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [mounted, setVoices, setSelectedVoice, selectedVoice]);

  const filteredVoices = React.useMemo(() => {
    if (!voices) return [];
    return voices.filter(
      (voice) =>
        voice.name.toLowerCase().includes(search.toLowerCase()) ||
        voice.lang.toLowerCase().includes(search.toLowerCase()) ||
        getLanguageName(voice.lang).toLowerCase().includes(search.toLowerCase())
    );
  }, [voices, search]);

  const groupedVoices = React.useMemo(() => {
    return groupVoicesByLanguage(filteredVoices);
  }, [filteredVoices]);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        className="w-[300px] justify-between text-left font-normal"
      >
        Loading voices...
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between text-left font-normal"
        >
          {selectedVoice ? (
            <span className="flex items-center gap-2 min-w-0 flex-1">
              <span className="truncate">{selectedVoice.name}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                ({getLanguageName(selectedVoice.lang)})
              </span>
            </span>
          ) : (
            "Select voice..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search voices..."
            value={search}
            onValueChange={setSearch}
          />
          <div className="px-3 py-2 text-xs text-muted-foreground border-b">
            {search
              ? `${filteredVoices.length} of ${voices?.length || 0} voices`
              : `${voices?.length || 0} voices available`}
          </div>
          <CommandEmpty>No voice found.</CommandEmpty>
          <CommandList className="max-h-[300px] overflow-auto">
            {groupedVoices.map(([language, languageVoices]) => (
              <CommandGroup
                key={language}
                heading={
                  <span className="font-semibold">
                    {language + " (" + languageVoices.length + ")"}
                  </span>
                }
              >
                {languageVoices.map((voice) => (
                  <CommandItem
                    key={voice.voiceURI}
                    value={voice.voiceURI}
                    onSelect={() => {
                      setSelectedVoice(voice);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedVoice?.voiceURI === voice.voiceURI
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">{voice.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {voice.lang} {voice.localService ? "(Local)" : ""}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

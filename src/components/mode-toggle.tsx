"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button variant="outline" size="icon" onClick={handleThemeToggle}>
      <Sun
        className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0"
        size={16}
      />
      <Moon
        className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-0 transition-all dark:scale-100"
        size={16}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

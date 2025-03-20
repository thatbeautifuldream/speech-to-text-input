import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

export function Header() {
  return (
    <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <header className="mx-auto max-w-screen-2xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex">
            <Link href="/" className="flex items-center space-x-2">
              <span className={cn("font-bold", bricolage.className)}>
                STT & TTS Demo
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
          </div>
        </div>
      </header>
    </div>
  );
}

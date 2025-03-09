import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background">
      <div className="container flex h-14 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Created by{" "}
          <Link
            href="https://milindmishra.com"
            className="font-medium underline underline-offset-4 hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            Milind Mishra
          </Link>
        </p>
      </div>
    </footer>
  );
}

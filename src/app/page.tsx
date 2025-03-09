import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import SpeechToText from "./page.client";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
        <Header />
      </div>

      <main className="flex-grow">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 py-8">
          <SpeechToText className="max-w-2xl mx-auto" />
        </div>
      </main>

      <div className="mx-auto w-full max-w-7xl sm:px-6 lg:px-8">
        <Footer />
      </div>
    </div>
  );
}

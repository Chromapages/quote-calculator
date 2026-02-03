import { QuoteForm } from "./components/QuoteForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Chromapages Quote Calculator</h1>
          <p className="text-gray-500">Instant estimates for your next web project</p>
        </div>
        <QuoteForm />
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SavedQuote } from "@/lib/quotes";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchQuotes();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchQuotes = async () => {
    try {
      const q = query(collection(db, "quotes"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Handle Firestore timestamp safely
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      }));
      setQuotes(data);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Admin Login</h1>
          <button
            onClick={handleLogin}
            className="rounded-full bg-[#111118] px-6 py-3 text-white transition hover:bg-gray-800"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#111118]">Quote Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user.displayName}</p>
          </div>
          <button
            onClick={() => auth.signOut()}
            className="text-sm text-red-500 hover:underline"
          >
            Sign Out
          </button>
        </header>

        <div className="grid gap-4">
          {quotes.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm">
              No quotes generated yet.
            </div>
          ) : (
            quotes.map((quote) => (
              <div
                key={quote.id}
                className="grid gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md lg:grid-cols-[2fr_1fr_1fr_auto]"
              >
                <div>
                  <h3 className="text-lg font-semibold text-[#111118]">
                    {quote.contactName || "Unknown Visitor"}
                  </h3>
                  <p className="text-sm text-gray-500">{quote.email}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(quote.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-xs uppercase tracking-wider text-gray-400">Budget</span>
                  <span className="text-lg font-semibold text-[#111118]">
                    ${quote.quoteResult?.min?.toLocaleString()} - ${quote.quoteResult?.max?.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-xs uppercase tracking-wider text-gray-400">Project</span>
                  <span className="font-medium text-gray-700 capitalize">
                    {quote.siteType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {quote.designLevel} design
                  </span>
                </div>

                <div className="flex items-center">
                  <div className="rounded-lg bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                    {quote.features?.length || 0} features
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

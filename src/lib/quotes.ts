import { addDoc, collection, serverTimestamp, type FieldValue } from "firebase/firestore";
import { db } from "./firebase";
import { QuoteBreakdown, QuoteInput } from "./pricing";

export type SavedQuote = QuoteInput & {
  contactName: string;
  email: string;
  projectNotes: string;
  quoteResult: {
    min: number;
    max: number;
    breakdown: QuoteBreakdown;
  };
  createdAt: FieldValue;
};

export async function saveQuote(data: Omit<SavedQuote, "createdAt">) {
  try {
    const docRef = await addDoc(collection(db, "quotes"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving quote:", error);
    // We don't block the UI if saving fails, but we log it
    return null;
  }
}

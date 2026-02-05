import * as functions from "firebase-functions";
import axios from "axios";

export const syncToGHL = functions.firestore
  .document("quotes/{quoteId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const webhookUrl = process.env.GHL_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("GHL_WEBHOOK_URL is not set.");
      return;
    }

    const payload = {
      source: "quote-calculator",
      contact: {
        name: data.contactName,
        email: data.email,
        // Add phone if captured
      },
      quote: {
        min: data.quoteResult.min,
        max: data.quoteResult.max,
        breakdown: data.quoteResult.breakdown,
        id: context.params.quoteId
      }
    };

    try {
      await axios.post(webhookUrl, payload);
      console.log(`Synced quote ${context.params.quoteId} to GHL.`);
    } catch (error) {
      console.error("Failed to sync to GHL:", error);
    }
  });

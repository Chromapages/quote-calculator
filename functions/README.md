# Quote Calculator - Lead Sync (GHL)

This Cloud Function triggers whenever a new quote is created in Firestore.
It formats the lead data and sends it to a GoHighLevel webhook (Zapier/Make).

## Payload Structure
```json
{
  "source": "quote-calculator",
  "contact": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-0123"
  },
  "quote": {
    "total": 5000,
    "breakdown": { ... },
    "pdfUrl": "https://..."
  }
}
```

## Setup
1. Deploy to Firebase Functions
2. Set `GHL_WEBHOOK_URL` in environment variables

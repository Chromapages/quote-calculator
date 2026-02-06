export async function sendToGHL(quoteData: any) {
  const WEBHOOK_URL = process.env.NEXT_PUBLIC_GHL_WEBHOOK_URL;

  if (!WEBHOOK_URL) {
    console.warn('GHL Webhook URL not configured');
    return;
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: {
          name: quoteData.userInfo.name,
          email: quoteData.userInfo.email,
          phone: quoteData.userInfo.phone,
        },
        quote: {
          total: quoteData.total,
          features: quoteData.features,
          tier: quoteData.tier,
          id: quoteData.id
        },
        source: 'quote-calculator'
      }),
    });

    if (!response.ok) {
      throw new Error(`GHL Webhook failed: ${response.statusText}`);
    }

    console.log('Successfully sent to GHL');
  } catch (error) {
    console.error('Error sending to GHL:', error);
    // Don't throw - we don't want to block the UI if GHL fails
  }
}

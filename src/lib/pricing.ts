export interface QuoteInput {
  siteType: 'business' | 'ecommerce' | 'webapp' | 'landing';
  pageCount: number;
  features: string[];
  designLevel: 'template' | 'custom' | 'premium';
  timeline: 'rush' | 'standard' | 'flexible';
  location: 'us' | 'international';
}

export interface QuoteBreakdown {
  base: number;
  pages: number;
  features: number;
  design: number;
  timeline: number;
}

export interface QuoteResult {
  min: number;
  max: number;
  breakdown: QuoteBreakdown;
  timeline: string;
}

const pricingConfig = {
  basePrice: {
    business: 2500,
    ecommerce: 5000,
    webapp: 6000,
    landing: 1500,
  },
  pricePerPage: 200,
  featurePrices: {
    cms: 500,
    booking: 800,
    payments: 1000,
    blog: 400,
    membership: 1200,
    customForms: 300,
    seo: 300,
    analytics: 200,
  },
  designMultipliers: {
    template: 1.0,
    custom: 1.5,
    premium: 2.0,
  },
  timelineMultipliers: {
    flexible: 0.9,
    standard: 1.0,
    rush: 1.25,
  },
  locationMultipliers: {
    us: 1.0,
    international: 1.1,
  },
};

export function calculateQuote(input: QuoteInput): QuoteResult {
  // Base price
  const base = pricingConfig.basePrice[input.siteType];
  
  // Pages (first page included in base)
  const additionalPages = Math.max(0, input.pageCount - 1);
  const pages = additionalPages * pricingConfig.pricePerPage;
  
  // Features
  const features = input.features.reduce((sum, feature) => {
    return sum + (pricingConfig.featurePrices[feature as keyof typeof pricingConfig.featurePrices] || 0);
  }, 0);
  
  // Subtotal before multipliers
  const subtotal = base + pages + features;
  
  // Multipliers
  const designMultiplier = pricingConfig.designMultipliers[input.designLevel];
  const timelineMultiplier = pricingConfig.timelineMultipliers[input.timeline];
  const locationMultiplier = pricingConfig.locationMultipliers[input.location];
  
  // Calculate adjustments
  const design = Math.round(subtotal * (designMultiplier - 1));
  const timeline = Math.round(subtotal * (timelineMultiplier - 1));
  const location = Math.round(subtotal * (locationMultiplier - 1));
  
  // Total with 10% range
  const total = subtotal + design + timeline + location;
  const min = Math.round(total * 0.95);
  const max = Math.round(total * 1.05);
  
  // Timeline estimate
  const timelines: Record<string, string> = {
    rush: '2-3 weeks',
    standard: '4-6 weeks',
    flexible: '6-8 weeks',
  };
  
  return {
    min,
    max,
    breakdown: {
      base,
      pages,
      features,
      design,
      timeline,
    },
    timeline: timelines[input.timeline],
  };
}

export type SiteType = 'business' | 'ecommerce' | 'webapp' | 'landing';
export type DesignLevel = 'template' | 'custom' | 'premium';
export type Timeline = 'rush' | 'standard' | 'flexible';

export interface QuoteRequest {
  siteType: SiteType;
  pageCount: number;
  features: string[];
  designLevel: DesignLevel;
  timeline: Timeline;
  location?: 'us' | 'international';
}

export interface QuoteBreakdown {
  base: number;
  pages: number;
  features: number;
  design: number;
  timeline: number;
  total: number;
}

export const PRICING_CONFIG = {
  basePrices: {
    landing: 1500,
    business: 2500,
    ecommerce: 3500,
    webapp: 5000,
  } as Record<SiteType, number>,
  
  pricePerPage: 200, // Cost per additional page beyond included
  includedPages: {
    landing: 1,
    business: 5,
    ecommerce: 10,
    webapp: 5,
  } as Record<SiteType, number>,

  featurePrices: {
    'cms': 500,
    'booking': 300,
    'payments': 500,
    'blog': 300,
    'membership': 1000,
    'seo': 500,
    'analytics': 200,
    'chat': 200,
  } as Record<string, number>,

  designMultipliers: {
    template: 1.0,
    custom: 1.5,
    premium: 2.0,
  } as Record<DesignLevel, number>,

  timelineMultipliers: {
    flexible: 0.9,
    standard: 1.0,
    rush: 1.25,
  } as Record<Timeline, number>,
};

export function calculateQuote(request: QuoteRequest): QuoteBreakdown {
  const { siteType, pageCount, features, designLevel, timeline } = request;
  
  // 1. Base Price
  const base = PRICING_CONFIG.basePrices[siteType];

  // 2. Page Cost
  const included = PRICING_CONFIG.includedPages[siteType];
  const extraPages = Math.max(0, pageCount - included);
  const pagesCost = extraPages * PRICING_CONFIG.pricePerPage;

  // 3. Feature Cost
  const featuresCost = features.reduce((acc, feature) => {
    return acc + (PRICING_CONFIG.featurePrices[feature] || 0);
  }, 0);

  // 4. Subtotal for Design Multiplier
  const subtotalBeforeDesign = base + pagesCost + featuresCost;
  
  // Design Multiplier applies to the construction cost (Base + Pages + Features)
  // Or should it just apply to base? PRD example said "Custom design: x1.5".
  // Let's assume it scales the whole build effort.
  // Breakdown requires "design" component. Let's calculate the delta.
  const designMultiplier = PRICING_CONFIG.designMultipliers[designLevel];
  const totalAfterDesign = subtotalBeforeDesign * designMultiplier;
  const designCost = totalAfterDesign - subtotalBeforeDesign;

  // 5. Timeline Multiplier
  // Applies to the total scoped work
  const timelineMultiplier = PRICING_CONFIG.timelineMultipliers[timeline];
  const totalAfterTimeline = totalAfterDesign * timelineMultiplier;
  const timelineCost = totalAfterTimeline - totalAfterDesign;

  return {
    base,
    pages: pagesCost,
    features: featuresCost,
    design: designCost,
    timeline: timelineCost,
    total: Math.round(totalAfterTimeline),
  };
}

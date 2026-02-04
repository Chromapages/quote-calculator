'use client';

import dynamic from 'next/dynamic';
import { QuoteBreakdown, QuoteInput } from '../lib/pricing';
import { QuotePDF } from './QuotePDF';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="rounded-full bg-[#f46a4d]/50 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f46a4d]/30"
      >
        Preparing PDF...
      </button>
    ),
  }
);

interface DownloadQuoteProps {
  request: QuoteInput;
  breakdown: QuoteBreakdown;
  min: number;
  max: number;
  fileName?: string;
}

export function DownloadQuote({
  request,
  breakdown,
  min,
  max,
  fileName = 'web-project-quote.pdf',
}: DownloadQuoteProps) {
  return (
    <PDFDownloadLink
      document={
        <QuotePDF
          request={request}
          breakdown={breakdown}
          min={min}
          max={max}
        />
      }
      fileName={fileName}
    >
      {({ blob, url, loading, error }) => (
        <button
          disabled={loading}
          className="rounded-full bg-[#f46a4d] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#f46a4d]/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Preparing PDF...' : 'Download Proposal PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateQuote, QuoteRequest, QuoteBreakdown, PRICING_CONFIG, SiteType, DesignLevel, Timeline } from '@/app/lib/pricing';
import dynamic from 'next/dynamic';
import { QuotePDF } from './QuotePDF';

// Dynamically load PDFDownloadLink to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <button className="w-full h-full py-3 bg-gray-400 text-white rounded-xl font-medium">Loading PDF...</button>,
  }
);

export function QuoteForm() {
  const [step, setStep] = useState(1);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [formData, setFormData] = useState<QuoteRequest>({
    siteType: 'business',
    pageCount: 5,
    features: [],
    designLevel: 'template',
    timeline: 'standard',
    location: 'us',
  });
  const [result, setResult] = useState<QuoteBreakdown | null>(null);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const calculate = () => {
    const quote = calculateQuote(formData);
    setResult(quote);
    nextStep();
  };

  const updateField = (field: keyof QuoteRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => {
      const current = prev.features;
      if (current.includes(feature)) {
        return { ...prev, features: current.filter(f => f !== feature) };
      } else {
        return { ...prev, features: [...current, feature] };
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-blue-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Project Estimator</h2>
        <p className="text-blue-100 text-sm mt-1">Step {step} of 5</p>
        <div className="w-full bg-blue-800/30 h-1.5 mt-4 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-800">What are we building?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(PRICING_CONFIG.basePrices) as SiteType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateField('siteType', type)}
                    className={cn(
                      "p-4 border-2 rounded-xl text-left transition-all hover:border-blue-200",
                      formData.siteType === type 
                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" 
                        : "border-gray-200"
                    )}
                  >
                    <div className="font-semibold capitalize text-gray-900">{type}</div>
                    <div className="text-xs text-gray-500 mt-1">Starting at ${PRICING_CONFIG.basePrices[type]}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-800">Scope & Scale</h3>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Number of Pages: <span className="text-blue-600 font-bold text-lg">{formData.pageCount}</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={formData.pageCount}
                  onChange={(e) => updateField('pageCount', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1 Page</span>
                  <span>50 Pages</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Key Features</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(PRICING_CONFIG.featurePrices).map((feature) => (
                    <button
                      key={feature}
                      onClick={() => toggleFeature(feature)}
                      className={cn(
                        "flex items-center p-3 text-sm border rounded-lg transition-colors",
                        formData.features.includes(feature)
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center mr-2",
                        formData.features.includes(feature) ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      )}>
                        {formData.features.includes(feature) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="capitalize">{feature}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-800">Design & Timeline</h3>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Design Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['template', 'custom', 'premium'] as DesignLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => updateField('designLevel', level)}
                      className={cn(
                        "p-3 text-sm border rounded-lg capitalize transition-all",
                        formData.designLevel === level
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Timeline Priority</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['flexible', 'standard', 'rush'] as Timeline[]).map((time) => (
                    <button
                      key={time}
                      onClick={() => updateField('timeline', time)}
                      className={cn(
                        "p-3 text-sm border rounded-lg capitalize transition-all",
                        formData.timeline === time
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Calculate?</h3>
              <p className="text-gray-500 mb-8">We've gathered all the details for your estimate.</p>
              
              <button
                onClick={calculate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-200 transition-all transform hover:scale-105"
              >
                Generate Quote
              </button>
            </motion.div>
          )}

          {step === 5 && result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center pb-6 border-b border-gray-100">
                <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Estimated Project Total</p>
                <div className="text-4xl font-bold text-gray-900">
                  ${result.total.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Base Price ({formData.siteType})</span>
                  <span>${result.base.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Additional Pages</span>
                  <span>+${result.pages.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Features ({formData.features.length})</span>
                  <span>+${result.features.toLocaleString()}</span>
                </div>
                {result.design > 0 && (
                  <div className="flex justify-between text-blue-600 font-medium">
                    <span>Design Upgrade ({formData.designLevel})</span>
                    <span>+${result.design.toLocaleString()}</span>
                  </div>
                )}
                {result.timeline !== 0 && (
                  <div className="flex justify-between text-orange-600 font-medium">
                    <span>Timeline Adjustment</span>
                    <span>{result.timeline > 0 ? '+' : ''}${result.timeline.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50"
                >
                  Start Over
                </button>
                {isClient && (
                  <PDFDownloadLink
                    document={<QuotePDF request={formData} breakdown={result} />}
                    fileName={`quote-${formData.siteType}-${new Date().toISOString().split('T')[0]}.pdf`}
                    className="flex-1"
                  >
                    {({ loading }) => (
                      <button 
                        disabled={loading}
                        className="w-full h-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? 'Generating...' : 'Download PDF'}
                      </button>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step < 4 && (
        <div className="p-6 border-t border-gray-50 bg-gray-50 flex justify-between">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          <button 
            onClick={nextStep}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}

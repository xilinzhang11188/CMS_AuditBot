"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/file-upload';
import { CCM_CODES, analyzeNote } from '@/lib/data';
import { Check, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function NewAudit() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [inputMethod, setInputMethod] = useState<'upload' | 'paste'>('upload');
  const [selectedCode, setSelectedCode] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (uploadedFile) => {
    setFile(uploadedFile);
    setPastedText(''); // Clear pasted text when file is selected
  };

  const handleTextPaste = (text: string) => {
    setPastedText(text);
    setFile(null); // Clear file when text is pasted
  };

  const handleAnalyze = async () => {
    if ((!file && !pastedText) || !selectedCode) return;
    
    setIsAnalyzing(true);
    try {
      // Use pasted text if available, otherwise simulate file text
      const text = pastedText || "Simulated extracted text from file...";
      const result = await analyzeNote(text, selectedCode);
      
      // Store result in localStorage for the results page to pick up
      // In a real app, this would be an ID and we'd fetch from backend
      localStorage.setItem('currentAudit', JSON.stringify(result));
      
      // Also add to history
      const history = JSON.parse(localStorage.getItem('auditHistory') || '[]');
      history.unshift(result);
      localStorage.setItem('auditHistory', JSON.stringify(history));

      router.push(`/audit/${result.id}`);
    } catch (error) {
      console.error("Analysis failed", error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            <div className={cn("flex items-center space-x-2", step >= 1 ? "text-teal-400" : "text-slate-600")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", step >= 1 ? "border-teal-400 bg-teal-400/10" : "border-slate-600")}>
                1
              </div>
              <span className="font-medium">Upload Note</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-800" />
            <div className={cn("flex items-center space-x-2", step >= 2 ? "text-teal-400" : "text-slate-600")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", step >= 2 ? "border-teal-400 bg-teal-400/10" : "border-slate-600")}>
                2
              </div>
              <span className="font-medium">Select Code</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-800" />
            <div className={cn("flex items-center space-x-2", step >= 3 ? "text-teal-400" : "text-slate-600")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", step >= 3 ? "border-teal-400 bg-teal-400/10" : "border-slate-600")}>
                3
              </div>
              <span className="font-medium">Analyze</span>
            </div>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          {/* Step 1: Upload */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Add Clinical Note</h2>
                <p className="text-slate-400">Upload a file or paste your clinical documentation for automated compliance auditing.</p>
              </div>

              <div className="max-w-2xl mx-auto">
                {/* Input Method Toggle */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <button
                    onClick={() => setInputMethod('upload')}
                    className={cn(
                      "px-6 py-2 rounded-lg font-medium transition-all",
                      inputMethod === 'upload'
                        ? "bg-teal-500 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setInputMethod('paste')}
                    className={cn(
                      "px-6 py-2 rounded-lg font-medium transition-all",
                      inputMethod === 'paste'
                        ? "bg-teal-500 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    Paste Text
                  </button>
                </div>

                {/* File Upload */}
                {inputMethod === 'upload' && (
                  <FileUpload
                    selectedFile={file}
                    onFileSelect={handleFileSelect}
                    onClear={() => setFile(null)}
                  />
                )}

                {/* Text Paste Area */}
                {inputMethod === 'paste' && (
                  <div className="space-y-4">
                    <Card className="bg-slate-900 border-slate-800">
                      <CardContent className="p-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Clinical Note Text
                        </label>
                        <textarea
                          value={pastedText}
                          onChange={(e) => handleTextPaste(e.target.value)}
                          placeholder="Paste your clinical note text here..."
                          className="w-full h-64 bg-slate-800 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-slate-500">
                            {pastedText.length} characters
                          </p>
                          {pastedText && (
                            <button
                              onClick={() => setPastedText('')}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!file && !pastedText}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Code */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Select CCM Code</h2>
                <p className="text-slate-400">Choose the billing code you intend to use for this documentation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CCM_CODES.map((code) => (
                  <div
                    key={code.id}
                    onClick={() => setSelectedCode(code.id)}
                    className={cn(
                      "relative p-6 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg",
                      selectedCode === code.id
                        ? "bg-teal-500/10 border-teal-500 shadow-teal-500/20"
                        : "bg-slate-900/50 border-white/10 hover:border-white/20 hover:bg-white/5"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">{code.code}</h3>
                      {selectedCode === code.id && (
                        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="inline-block px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 mb-3">
                      {code.timeRequirement}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-3">
                      {code.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!selectedCode || isAnalyzing}
                  size="lg"
                  className="min-w-[140px]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Note <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

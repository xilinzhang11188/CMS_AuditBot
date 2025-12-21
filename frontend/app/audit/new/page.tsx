"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/file-upload';
import { CCM_CODES } from '@/lib/data';
import { fetchCCMCodes, CCMCode, uploadClinicalNote, ClinicalNoteUploadResponse, analyzeAudit } from '@/lib/api';
import { Check, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function NewAudit() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<'upload' | 'paste'>('upload');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [ccmCodes, setCcmCodes] = useState<CCMCode[]>(CCM_CODES);
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [codesError, setCodesError] = useState<string | null>(null);

  // Fetch CCM codes from backend on component mount
  useEffect(() => {
    async function loadCCMCodes() {
      try {
        setIsLoadingCodes(true);
        setCodesError(null);
        const codes = await fetchCCMCodes();
        setCcmCodes(codes);
      } catch (error) {
        console.error('Failed to fetch CCM codes:', error);
        setCodesError(error instanceof Error ? error.message : 'Failed to load CCM codes');
        // Fall back to static codes from data.js
        setCcmCodes(CCM_CODES);
      } finally {
        setIsLoadingCodes(false);
      }
    }

    loadCCMCodes();
  }, []);

  const handleFileSelect = async (uploadedFile: File | null) => {
    setFile(uploadedFile);
    setPastedText(''); // Clear pasted text when file is selected
    setExtractedText(''); // Clear extracted text
    setUploadError(null);
    
    // Automatically upload file to backend for text extraction
    if (uploadedFile) {
      setIsUploading(true);
      try {
        const response: ClinicalNoteUploadResponse = await uploadClinicalNote(uploadedFile);
        setExtractedText(response.extractedText);
        setNoteId(response.noteId);
      } catch (error) {
        console.error('Failed to upload file:', error);
        setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
        setFile(null); // Clear file on error
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleTextPaste = (text: string) => {
    setPastedText(text);
    setFile(null); // Clear file when text is pasted
    setExtractedText(''); // Clear extracted text
    setNoteId(null); // Clear note ID
    setUploadError(null);
  };

  const handleAnalyze = async () => {
    if ((!extractedText && !pastedText) || !selectedCode) return;
    
    setIsAnalyzing(true);
    setUploadError(null);
    
    try {
      // Use pasted text if available, otherwise use extracted text from file
      const text = pastedText || extractedText;
      
      // Call backend API to analyze the audit
      const response = await analyzeAudit({
        noteText: text,
        codeId: selectedCode,
        noteId: noteId || undefined
      });
      
      console.log('DEBUG: Analysis response:', response);
      console.log('DEBUG: Audit object:', response.audit);
      console.log('DEBUG: Audit ID from response.audit.id:', response.audit.id);
      console.log('DEBUG: Audit ID from response.audit._id:', (response.audit as any)._id);
      
      // Navigate to the audit detail page with the audit ID
      // Backend uses _id as the field name in JSON, but frontend expects id
      const auditId = response.audit.id || (response.audit as any)._id;
      if (auditId) {
        router.push(`/audit/${auditId}`);
      } else {
        console.error('ERROR: No audit ID in response');
        console.error('DEBUG: Full audit object:', JSON.stringify(response.audit, null, 2));
        setUploadError('Analysis completed but no audit ID received');
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("Analysis failed", error);
      setUploadError(error instanceof Error ? error.message : 'Failed to analyze audit');
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
                  <div className="space-y-4">
                    <FileUpload
                      selectedFile={file}
                      onFileSelect={handleFileSelect}
                      onClear={() => {
                        setFile(null);
                        setExtractedText('');
                        setNoteId(null);
                        setUploadError(null);
                      }}
                    />
                    
                    {/* Upload Status */}
                    {isUploading && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                        <span className="ml-3 text-slate-400">Extracting text from file...</span>
                      </div>
                    )}
                    
                    {/* Upload Error */}
                    {uploadError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-red-500 font-medium">Upload Failed</p>
                            <p className="text-sm text-slate-400 mt-1">{uploadError}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Extracted Text Preview */}
                    {extractedText && !uploadError && (
                      <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-300">
                              Extracted Text Preview
                            </label>
                            <span className="text-xs text-teal-500">✓ Ready</span>
                          </div>
                          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">
                              {extractedText.substring(0, 500)}
                              {extractedText.length > 500 && '...'}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            {extractedText.length} characters extracted
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
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
                    disabled={(!extractedText && !pastedText) || isUploading}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
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

              {isLoadingCodes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                  <span className="ml-3 text-slate-400">Loading CCM codes...</span>
                </div>
              ) : codesError ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-yellow-500 font-medium">Using cached CCM codes</p>
                      <p className="text-sm text-slate-400 mt-1">{codesError}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ccmCodes.map((code) => (
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

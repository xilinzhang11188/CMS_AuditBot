"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function FileUpload({ onFileSelect, selectedFile, onClear }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer group",
              isDragging 
                ? "border-teal-500 bg-teal-500/10" 
                : "border-slate-700 hover:border-teal-500/50 hover:bg-slate-800/50 bg-slate-900/30"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".txt,.doc,.docx,.pdf"
              onChange={handleFileInput}
            />
            
            <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-teal-500/20 flex items-center justify-center mb-4 transition-colors duration-300">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-teal-400" />
            </div>
            
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              Upload Clinical Note
            </h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Drag and drop your file here, or click to browse.
              <br />
              <span className="text-xs text-slate-500 mt-2 block">
                Supports PDF, DOCX, TXT (Max 10MB)
              </span>
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl border border-teal-500/30 bg-teal-500/5 p-6 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h4 className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-md">
                  {selectedFile.name}
                </h4>
                <p className="text-slate-400 text-sm">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-teal-400 text-sm mr-4">
                <CheckCircle className="w-4 h-4 mr-1" />
                Ready
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

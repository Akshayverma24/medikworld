import React from 'react';
import { Pill } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading details...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-12 h-12 flex items-center justify-center mb-3">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
        <Pill className="w-5 h-5 text-emerald-600 animate-pulse" />
      </div>
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
};

export default LoadingSpinner;

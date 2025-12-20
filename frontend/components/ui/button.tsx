"use client";

import React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', ...props }, ref) => {
  const variants = {
    primary: "bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white shadow-lg shadow-teal-500/20",
    secondary: "bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm",
    outline: "border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-12 rounded-md px-8 text-lg",
    icon: "h-10 w-10"
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };

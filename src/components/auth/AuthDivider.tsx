import React from "react";

export interface AuthDividerProps {
  label?: string;
}

export function AuthDivider({ label = "Or continue with email" }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200 dark:border-gray-800" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wider">
        <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 dark:text-gray-500 font-medium">
          {label}
        </span>
      </div>
    </div>
  );
}


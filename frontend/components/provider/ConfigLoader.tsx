"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/lib/hook";
import { setConfig } from "@/redux/features/config/configSlice";

export default function ConfigLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/config");
        if (!res.ok) throw new Error("Failed to load config");
        const data = await res.json();
        if (!data?.apiUrl) {
          throw new Error("API URL not found in config");
        }
        dispatch(setConfig(data.apiUrl));
        setError(null);
      } catch (err) {
        setError("Configuration Error: Please check your environment setup and try again.");
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Config loading error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 sr-only">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-red-800 font-medium">Configuration Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
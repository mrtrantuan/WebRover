'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';


export default function Home() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('Sending setup request...');
      const response = await fetch('http://localhost:8000/setup-browser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://www.google.com' }),
      });

      console.log('Response received:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to setup browser');
      }

      // If setup was successful, navigate to rover page
      router.push('/rover');
    } catch (error) {
      console.error('Failed to connect:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to browser');
    } finally {
      setIsConnecting(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Logo */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <Image
            src="/rover-logo.png"
            alt="WebRover Logo"
            width={96}
            height={96}
            className="object-contain"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
          WebRover
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-zinc-400">
          Your AI Co-pilot for Web Navigation
        </p>

        {/* Description */}
        <p className="text-zinc-500 max-w-lg mx-auto">
          Let WebRover handle your web tasks while you focus on what matters. 
          Powered by advanced AI to navigate, search, and gather information autonomously.
        </p>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full 
                   text-white font-medium hover:opacity-90 transition-opacity
                   shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect to Browser'}
        </button>
      </div>
    </div>
  );
}
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';

export default function Home() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('Attempting to connect...');
      const response = await fetch('http://localhost:8000/setup-browser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://www.google.com' }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to setup browser');
      }

      console.log('Connection successful, redirecting...');
      await router.push('/rover');
    } catch (error) {
      console.error('Failed to connect:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to browser');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <ParticlesBackground />
      
      <SpotlightCard 
        className="w-full max-w-3xl mx-auto p-8 md:p-12"
        spotlightColor="rgba(59, 130, 246, 0.15)"
        gradient="from-blue-500/20 to-teal-500/20"
      >
        <div className="space-y-12">
          {/* Title Section */}
          <div className="space-y-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
              WebRover
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400">
              Your AI Co-pilot for Web Navigation
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center">
              <div className="text-3xl">🔍</div>
              <h3 className="text-lg font-semibold text-zinc-200">Smart Search</h3>
              <p className="text-zinc-400">Intelligent web navigation and information retrieval</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="text-3xl">🤖</div>
              <h3 className="text-lg font-semibold text-zinc-200">AI Powered</h3>
              <p className="text-zinc-400">Advanced language models guide the navigation</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="text-3xl">⚡</div>
              <h3 className="text-lg font-semibold text-zinc-200">Real-time</h3>
              <p className="text-zinc-400">Live browser interaction and instant responses</p>
            </div>
          </div>

          {/* Connect Button */}
          <div className="pt-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full 
                       text-white font-medium transition-all duration-300
                       hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/25 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transform hover:scale-[1.02] active:scale-[0.98]
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {isConnecting ? 'Connecting...' : 'Connect to Browser'}
            </button>
            {error && (
              <p className="mt-4 text-red-400 text-center">{error}</p>
            )}
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RoverPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{type: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDisconnect = async () => {
    try {
      await fetch('http://localhost:8000/cleanup', {
        method: 'POST',
      });
      router.push('/');
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setMessages(prev => [...prev, data]);
            } catch (e) {
              console.error('Failed to parse SSE message:', e);
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to send query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-4 backdrop-blur-md bg-black/30 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
            WebRover
          </h1>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-full border border-red-500/50 text-red-500 
                     hover:bg-red-500/10 transition-colors"
          >
            Disconnect Browser
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto pt-24 p-4 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask WebRover anything..."
              className="w-full p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 
                       focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                       transition-colors outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-2 px-4 py-2 bg-gradient-to-r 
                       from-blue-500 to-teal-500 rounded-full text-white 
                       font-medium hover:opacity-90 transition-opacity 
                       disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Send'}
            </button>
          </div>
        </form>

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50"
            >
              <div className="text-sm text-zinc-500 mb-2">{message.type}</div>
              <div className="text-zinc-300">{message.content}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
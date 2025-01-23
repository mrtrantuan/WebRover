'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResponseDisplay } from '@/components/rover/ResponseDisplay';
import { QueryInput } from '@/components/rover/QueryInput';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';

interface Message {
  type: 'thought' | 'action' | 'final_answer' | 'error';
  content: string;
}

export default function RoverPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDisconnect = () => {
    router.push('/');
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setMessages([]); // Clear previous messages
    
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

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              const data = JSON.parse(jsonStr);

              // Format action content if it's an action message
              if (data.type === 'action' && typeof data.content === 'object') {
                const { action, args } = data.content;
                data.content = `${action}${args ? ` → ${args}` : ''}`;
              }

              // Validate the message format after potential transformation
              if (typeof data.type !== 'string' || typeof data.content !== 'string') {
                console.error('Invalid message format:', data);
                continue;
              }

              // Only add messages with valid types
              if (['thought', 'action', 'final_answer'].includes(data.type)) {
                setMessages(prev => [...prev, {
                  type: data.type,
                  content: data.content
                }]);
              }
            } catch (e) {
              console.error('Failed to parse SSE message:', e, line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send query:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Failed to connect to the server'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-zinc-900 via-black to-black">
      {/* Animated background */}
      <ParticlesBackground/>
      
      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-purple-500/5 to-teal-500/5 animate-flow" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-4 backdrop-blur-xl bg-black/30 z-50
                        border-b border-zinc-800/50 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 
                        text-transparent bg-clip-text animate-flow bg-[length:200%_auto]">
            WebRover
          </h1>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-full 
                     bg-gradient-to-r from-red-500/10 to-orange-500/10
                     border border-red-500/50 text-red-400
                     hover:bg-red-500/20 hover:border-red-500/70 hover:text-red-300
                     transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                     shadow-[0_2px_8px_rgba(239,68,68,0.25)]"
          >
            Disconnect Browser
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto pt-24 p-4 space-y-8 z-10">
        <div className="space-y-8 backdrop-blur-sm">
          <QueryInput
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
          <ResponseDisplay messages={messages} />
        </div>
      </main>
    </div>
  );
}
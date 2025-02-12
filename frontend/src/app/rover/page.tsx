'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResponseDisplay } from '@/components/rover/ResponseDisplay';
import { QueryInput } from '@/components/rover/QueryInput';
import { ParticlesBackground } from '@/components/ui/ParticlesBackground';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';

interface Message {
  type: 'thought' | 'action' | 'dom_update' | 'interaction' | 'browser_action' | 
        'rag_action' | 'review' | 'close_tab' | 'subtopics' | 'subtopic_answer' |
        'subtopic_status' | 'compile' | 'final_answer' | 'conversation_history' |
        'cleanup' | 'error' | 'final_response' | 'user_input';
  content: string;
}

type AgentType = 'task' | 'research' | 'deep_research';

export default function RoverPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResearchMode, setIsResearchMode] = useState(true);
  const [isDeepResearch, setIsDeepResearch] = useState(true);

  const currentAgent: AgentType = isResearchMode 
    ? (isDeepResearch ? 'deep_research' : 'research')
    : 'task';

  const handleDisconnect = async () => {
    try {
      const response = await fetch('http://localhost:8000/cleanup', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cleanup browser');
      }
      
      await router.push('/');
    } catch (error) {
      console.error('Failed to cleanup browser:', error);
      // Still try to navigate even if cleanup fails
      await router.push('/');
    }
  };

  const handleStreamingResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response reader');

    const decoder = new TextDecoder();
    let buffer = '';

    const processSSEMessage = (message: string) => {
      try {
        const jsonStr = message.replace(/^data: /, '').trim();
        const data = JSON.parse(jsonStr);
        
        if (data.type === 'keepalive') return;
        
        // Clean content if it matches the pattern
        const cleanContent = (content: any) => {
          // If content is already an array, return it directly
          if (Array.isArray(content)) {
            return content;
          }
          
          if (typeof content === 'string') {
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(content);
              if (Array.isArray(parsed)) {
                return parsed;
              }
              // If it's a string with ["..."] pattern
              if (content.startsWith('["') && content.endsWith('"]')) {
                return content.slice(2, -2);
              }
            } catch {
              // If parsing fails and it has the pattern
              if (content.startsWith('["') && content.endsWith('"]')) {
                return content.slice(2, -2);
              }
            }
          }
          return content;
        };

        const processedData = {
          type: data.type,
          content: cleanContent(data.content)
        };
        
        // Handle different message types based on agent
        switch (data.type) {
          case 'thought':
          case 'action':
          case 'browser_action':
          case 'final_answer':
          case 'final_response':
          case 'dom_update':
          case 'interaction':
            setMessages(prev => [...prev, processedData]);
            break;
          
          // Research specific events
          case 'rag_action':
          case 'review':
          case 'close_tab':
          case 'cleanup':
            if (isResearchMode) {
              setMessages(prev => [...prev, processedData]);
            }
            break;
          
          // Deep research specific events
          case 'subtopics':
          case 'subtopic_answer':
          case 'subtopic_status':
          case 'compile':
            if (isResearchMode && isDeepResearch) {
              setMessages(prev => [...prev, processedData]);
            }
            break;
          
          case 'error':
            setMessages(prev => [...prev, processedData]);
            break;
        }
      } catch (e) {
        console.error('Failed to parse SSE message:', message, e);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Find complete SSE messages
      const messages = buffer.match(/data: {[\s\S]*?}\n\n/g);
      
      if (messages) {
        messages.forEach(processSSEMessage);
        // Remove processed messages from buffer
        buffer = buffer.slice(buffer.lastIndexOf('}') + 1);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    // Add user message to the chat history
    setMessages(prev => [...prev, { type: 'user_input', content: query }]);
    const currentQuery = query;
    setQuery(''); // Clear input after sending

    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentQuery,
          agent_type: currentAgent 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send query');
      }

      await handleStreamingResponse(response);
    } catch (error: any) {
      console.error('Query failed:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: error?.message || 'Failed to process query. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950/20 to-black">
      <ParticlesBackground />
      
      {/* Header with Toggles */}
      <header className="fixed top-0 left-0 right-0 p-4 backdrop-blur-xl bg-black/30 z-50
                      border-b border-zinc-800/50 shadow-lg shadow-black/20">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 
                        text-transparent bg-clip-text animate-flow bg-[length:200%_auto]">
            WebRover
          </h1>
          
          <div className="flex-1 flex justify-center items-center">
            <div className="flex items-center space-x-24">
              <div className="flex flex-col items-center min-w-[280px]">
                <div className="flex items-center space-x-6">
                  <span className="text-zinc-400">Task</span>
                  <ToggleSwitch
                    enabled={isResearchMode}
                    onChange={setIsResearchMode}
                    label=""
                  />
                  <span className="text-zinc-400">Research</span>
                </div>
                <span className="text-xs text-zinc-500 mt-2">Switch between Task and Research agents</span>
              </div>
              
              <div className={`flex flex-col items-center min-w-[280px] transition-opacity duration-300 ${isResearchMode ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center space-x-6">
                  <span className="text-zinc-400">Normal</span>
                  <ToggleSwitch
                    enabled={isDeepResearch}
                    onChange={setIsDeepResearch}
                    label=""
                  />
                  <span className="text-zinc-400">Deep Research</span>
                </div>
                <span className="text-xs text-zinc-500 mt-2">Enable comprehensive research mode</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-full whitespace-nowrap
                     bg-gradient-to-r from-rose-500/10 to-pink-500/10
                     border border-rose-500/50 text-rose-400
                     hover:bg-rose-500/20 hover:border-rose-500/70 hover:text-rose-300
                     transition-all duration-300"
          >
            Disconnect Browser
          </button>
        </div>
      </header>

      {/* Input Bar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-[800px] px-4">
        <QueryInput
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content */}
      <main className="relative pt-24 pb-32 z-10 overflow-y-auto h-[calc(100vh-140px)]">
        <div className="w-full pb-16">
          <ResponseDisplay messages={messages} />
        </div>
      </main>
    </div>
  );
}
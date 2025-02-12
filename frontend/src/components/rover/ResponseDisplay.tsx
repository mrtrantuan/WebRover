import { SpotlightCard } from '@/components/ui/SpotlightCard';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo, useRef } from 'react';

interface Message {
  type: 'thought' | 'action' | 'dom_update' | 'interaction' | 'browser_action' | 
        'rag_action' | 'review' | 'close_tab' | 'subtopics' | 'subtopic_answer' |
        'subtopic_status' | 'compile' | 'final_answer' | 'conversation_history' |
        'cleanup' | 'error' | 'final_response' | 'user_input';
  content: string;
}

interface ResponseDisplayProps {
  messages: Message[];
}

function useTemporaryMessages(messages: Message[]) {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);

  useEffect(() => {
    const finalMessage = messages.find(m => 
      m.type === 'final_answer' || m.type === 'final_response'
    );

    if (finalMessage) {
      setVisibleMessages([]);
      return;
    }

    const streamingMessages = messages.filter(m => 
      m.type !== 'final_answer' && 
      m.type !== 'final_response' && 
      m.type !== 'user_input'
    );
    
    setVisibleMessages(streamingMessages);
  }, [messages]);

  return visibleMessages;
}

// Helper function to stringify message content
function formatMessageContent(content: any): string {
  if (typeof content === 'string') return content;
  if (typeof content === 'object') {
    if (content.thought) return content.thought;
    return JSON.stringify(content, null, 2);
  }
  return String(content);
}

// Define markdown components
const markdownComponents = {
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        className="!my-8 rounded-xl border border-white/10 !bg-zinc-900/50 !p-6"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-zinc-800/50 px-2 py-1 rounded-md font-mono text-sm text-indigo-300" {...props}>
        {children}
      </code>
    );
  }
};

export function ResponseDisplay({ messages }: ResponseDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement?.parentElement?.parentElement;
      container?.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Scroll on new messages with a slight delay to ensure content is rendered
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Group messages by conversation turns
  const messageGroups = useMemo(() => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];
    
    messages.forEach((message) => {
      if (message.type === 'user_input') {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  }, [messages]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 px-4">
      <AnimatePresence mode="popLayout">
        {messageGroups.map((group, groupIndex) => {
          const userMessage = group.find(m => m.type === 'user_input');
          const finalMessage = group.find(m => 
            m.type === 'final_answer' || m.type === 'final_response'
          );
          const streamingMessages = !finalMessage ? group.filter(m => 
            m.type !== 'user_input' && 
            m.type !== 'final_answer' && 
            m.type !== 'final_response'
          ) : [];

          return (
            <motion.div
              key={`group-${groupIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* User Message */}
              {userMessage && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[90%] md:max-w-[75%] break-words bg-gradient-to-r from-indigo-500/20 
                              via-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-indigo-500/30 
                              rounded-2xl rounded-tr-sm px-5 py-3 shadow-lg shadow-purple-500/10">
                    <p className="text-sm font-medium text-white/90 whitespace-pre-wrap">
                      {formatMessageContent(userMessage.content)}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Streaming Messages */}
              {streamingMessages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  {streamingMessages.map((message, index) => (
                    <motion.div
                      key={`stream-${groupIndex}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex justify-start"
                    >
                      <div className={`max-w-[90%] md:max-w-[75%] break-words backdrop-blur-sm border 
                        px-4 py-2 rounded-xl rounded-tl-sm
                        ${message.type.includes('action') 
                          ? 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/20' 
                          : 'bg-zinc-500/10 border-zinc-500/30 shadow-zinc-500/20'} 
                        shadow-lg`}>
                        <p className="text-sm text-white/70 whitespace-pre-wrap">
                          {formatMessageContent(message.content)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Final Response */}
              {finalMessage && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[90%] md:max-w-[75%] break-words bg-gradient-to-br from-indigo-500/20 
                              via-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-indigo-500/30 
                              rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl shadow-indigo-500/20">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                      className="prose prose-invert max-w-none
                        /* Base Styles */
                        prose-p:text-zinc-100 prose-p:leading-7 prose-p:mb-4
                        
                        /* Headings */
                        prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-8 
                        prose-h1:bg-gradient-to-r prose-h1:from-indigo-400 prose-h1:via-purple-400 prose-h1:to-pink-400
                        prose-h1:bg-clip-text prose-h1:text-transparent
                        
                        /* Headings */
                        prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-6 
                        prose-h2:text-indigo-300 prose-h2:pb-2 prose-h2:border-b 
                        prose-h2:border-indigo-500/20
                        
                        prose-h3:text-xl prose-h3:font-medium prose-h3:mb-4
                        prose-h3:text-purple-300
                        
                        /* Lists */
                        prose-ul:space-y-2 prose-ul:my-4 prose-ul:list-none
                        prose-ul:[&>li]:flex prose-ul:[&>li]:items-start 
                        prose-ul:[&>li]:before:content-['•'] prose-ul:[&>li]:before:text-indigo-400
                        prose-ul:[&>li]:before:mr-2 prose-ul:[&>li]:before:font-bold
                        
                        prose-ol:space-y-2 prose-ol:my-4 prose-ol:list-decimal
                        prose-ol:[&>li]:pl-2 prose-ol:[&>li]:text-zinc-100
                        
                        /* Inline Elements */
                        prose-strong:text-indigo-300 prose-strong:font-semibold
                        prose-em:text-purple-300 prose-em:italic
                        
                        /* Links */
                        prose-a:text-indigo-400 prose-a:no-underline 
                        hover:prose-a:text-indigo-300 prose-a:transition-colors
                        
                        /* Blockquotes */
                        prose-blockquote:border-l-4 prose-blockquote:border-indigo-500/50
                        prose-blockquote:bg-indigo-500/5 prose-blockquote:pl-6 
                        prose-blockquote:py-4 prose-blockquote:my-6
                        prose-blockquote:rounded-r-lg prose-blockquote:italic
                        
                        /* Code Blocks */
                        prose-code:bg-zinc-800/50 prose-code:text-indigo-300 
                        prose-code:px-2 prose-code:py-1 prose-code:rounded-md 
                        prose-code:font-mono prose-code:text-sm
                        
                        /* Tables */
                        prose-table:w-full prose-table:my-6
                        prose-th:text-indigo-300 prose-th:font-semibold
                        prose-td:text-zinc-100 prose-td:py-2
                        prose-td:border-b prose-td:border-zinc-800"
                    >
                      {formatMessageContent(finalMessage.content)}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} className="h-px" />
    </div>
  );
}
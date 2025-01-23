import { SpotlightCard } from '@/components/ui/SpotlightCard';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  type: 'thought' | 'action' | 'final_answer' | 'error';
  content: string;
}

interface ResponseDisplayProps {
  messages: Message[];
}

export function ResponseDisplay({ messages }: ResponseDisplayProps) {
  const thoughts = messages.filter(m => m.type === 'thought');
  const actions = messages.filter(m => m.type === 'action');
  const finalAnswer = messages.find(m => m.type === 'final_answer');

  return (
    <div className="flex">
      {/* Wider Sidebar with animations */}
      <div className="w-96 fixed left-0 top-0 bottom-0 bg-black/30 backdrop-blur-md border-r border-zinc-800/50
                    pt-24 pb-4 px-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Thoughts Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider px-2">Thoughts</h3>
            <AnimatePresence>
              {thoughts.map((message, index) => (
                <motion.div
                  key={`thought-${index}`}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-zinc-900/30 rounded-lg p-3 border-l-4 border-l-purple-500
                           border border-purple-500/20 shadow-lg"
                >
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {message.content}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Actions Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider px-2">Actions</h3>
            <AnimatePresence>
              {actions.map((message, index) => (
                <motion.div
                  key={`action-${index}`}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-zinc-900/30 rounded-lg p-3 border-l-4 border-l-green-500
                           border border-green-500/20 shadow-lg"
                >
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {message.content}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content - keeping the original formatting */}
      <div className="flex-1 ml-96">
        {finalAnswer && (
          <div className="max-w-3xl mx-auto p-6">
            <SpotlightCard 
              className="p-6"
              gradient="from-purple-500/20 to-pink-500/20"
              spotlightColor="rgba(168, 85, 247, 0.15)"
            >
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg border border-zinc-700/50 !bg-zinc-900/50 !my-4"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-zinc-800/50 rounded px-1.5 py-0.5 text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-zinc-200">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-zinc-200">{children}</h2>,
                    p: ({ children }) => <p className="text-zinc-300 leading-relaxed mb-4">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-zinc-300">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-zinc-300">{children}</ol>,
                  }}
                >
                  {finalAnswer.content}
                </ReactMarkdown>
              </div>
            </SpotlightCard>
          </div>
        )}
      </div>
    </div>
  );
}
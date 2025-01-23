import { SpotlightCard } from '@/components/ui/SpotlightCard';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

interface Message {
  type: 'thought' | 'action' | 'final_answer' | 'error';
  content: string;
}

interface ResponseDisplayProps {
  messages: Message[];
}

export function ResponseDisplay({ messages }: ResponseDisplayProps) {
  const getMessageStyles = (type: Message['type']) => {
    switch (type) {
      case 'thought':
        return 'from-blue-500/20 to-purple-500/20';
      case 'action':
        return 'from-green-500/20 to-emerald-500/20';
      case 'final_answer':
        return 'from-purple-500/20 to-pink-500/20';
      case 'error':
        return 'from-red-500/20 to-orange-500/20';
      default:
        return 'from-zinc-500/20 to-zinc-600/20';
    }
  };

  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <SpotlightCard
          key={index}
          className="p-6"
          gradient={getMessageStyles(message.type)}
          spotlightColor={`rgba(${
            message.type === 'thought' ? '147, 51, 234' :
            message.type === 'action' ? '34, 197, 94' :
            message.type === 'final_answer' ? '168, 85, 247' :
            '239, 68, 68'}, 0.15)`}
        >
          <div className="space-y-4">
            <span className={`
              inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium
              ${message.type === 'thought' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : ''}
              ${message.type === 'action' ? 'bg-green-500/10 text-green-300 border border-green-500/20' : ''}
              ${message.type === 'final_answer' ? 'bg-pink-500/10 text-pink-300 border border-pink-500/20' : ''}
              ${message.type === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : ''}
            `}>
              {message.type.replace('_', ' ').toUpperCase()}
            </span>
            
            {message.type === 'final_answer' ? (
              <div className="prose prose-invert max-w-none prose-headings:text-zinc-200 
                            prose-p:text-zinc-300 prose-strong:text-zinc-200 
                            prose-ul:text-zinc-300 prose-ol:text-zinc-300
                            prose-pre:bg-transparent prose-pre:p-0
                            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
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
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-zinc-300 leading-relaxed mb-4">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
                    li: ({ children }) => <li className="text-zinc-300 ml-4">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-zinc-700 pl-4 my-4 italic text-zinc-400">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
            )}
          </div>
        </SpotlightCard>
      ))}
    </div>
  );
}
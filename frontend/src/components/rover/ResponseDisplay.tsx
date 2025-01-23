import { SpotlightCard } from '@/components/ui/SpotlightCard';

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
            spotlightColor={`rgba(${message.type === 'thought' ? '147, 51, 234' : 
                                   message.type === 'action' ? '34, 197, 94' :
                                   message.type === 'final_answer' ? '168, 85, 247' :
                                   '239, 68, 68'}, 0.15)`}
          >
            <div className="space-y-3">
              <span className={`
                inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium
                ${message.type === 'thought' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : ''}
                ${message.type === 'action' ? 'bg-green-500/10 text-green-300 border border-green-500/20' : ''}
                ${message.type === 'final_answer' ? 'bg-pink-500/10 text-pink-300 border border-pink-500/20' : ''}
                ${message.type === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/20' : ''}
              `}>
                {message.type.replace('_', ' ').toUpperCase()}
              </span>
              
              <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    );
  }
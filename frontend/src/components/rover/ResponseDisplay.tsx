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
          return 'border-blue-500/30 bg-blue-500/10';
        case 'action':
          return 'border-green-500/30 bg-green-500/10';
        case 'final_answer':
          return 'border-purple-500/30 bg-purple-500/10';
        case 'error':
          return 'border-red-500/30 bg-red-500/10';
        default:
          return 'border-zinc-800 bg-zinc-900/50';
      }
    };

    return (
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getMessageStyles(message.type)}`}
          >
            <div className="text-sm text-zinc-400 mb-2 capitalize">
              {message.type.replace('_', ' ')}
            </div>
            <div className="text-zinc-300 whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        ))}
      </div>
    );
  }
interface Message {
    type: string;
    content: string;
  }
  
  interface ResponseDisplayProps {
    messages: Message[];
  }
  
  export function ResponseDisplay({ messages }: ResponseDisplayProps) {
    return (
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
    );
  }
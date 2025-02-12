import { Button } from '../ui/Button';
import { useRef, useState } from 'react';

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function QueryInput({ value, onChange, onSubmit, isLoading }: QueryInputProps) {
  const inputRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-center">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            placeholder="Ask WebRover anything..."
            className="w-full px-6 py-4 bg-zinc-900/50 backdrop-blur-sm 
                     border border-zinc-800 rounded-2xl
                     text-zinc-100 placeholder-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50
                     focus:border-purple-500/50
                     hover:border-zinc-700 transition-all duration-300"
          />
          
          <button
            onClick={onSubmit}
            disabled={isLoading || !value.trim()}
            className="absolute right-2 px-6 py-2.5 
                     bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                     rounded-xl text-white font-medium
                     hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/25
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transform hover:scale-[1.02] active:scale-[0.98]
                     transition-all duration-300"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white/90 
                            rounded-full animate-spin" />
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 
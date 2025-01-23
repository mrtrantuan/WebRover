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
    <div className="relative flex items-center w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="Ask WebRover anything..."
        className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-24 sm:pr-32 
                  rounded-full bg-zinc-900/50 
                  border border-zinc-800 backdrop-blur-xl
                  text-zinc-100 placeholder-zinc-500
                  focus:outline-none focus:border-blue-500/50
                  transition-all duration-300
                  text-sm sm:text-base"
      />
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="absolute right-2 px-4 sm:px-6 py-1.5 sm:py-2 
                  rounded-full bg-gradient-to-r from-blue-500 to-teal-500
                  text-white text-sm sm:text-base font-medium
                  hover:from-blue-600 hover:to-teal-600
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300"
      >
        {isLoading ? 'Thinking...' : 'Send'}
      </button>
    </div>
  );
} 
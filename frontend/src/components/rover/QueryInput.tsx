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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="relative">
      <div 
        ref={inputRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpacity(1)}
        onMouseLeave={() => setOpacity(0)}
        className="relative rounded-full overflow-hidden group
                  border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm
                  transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80
                  shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
      >
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        {/* Spotlight effect */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isLoading ? 0.15 : opacity * 0.15,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
          }}
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask WebRover anything..."
          className="w-full p-4 pr-24 bg-transparent 
                   border border-zinc-700/50 rounded-full relative z-10
                   focus:border-zinc-600/50 focus:ring-2 focus:ring-blue-500/20
                   transition-all duration-300 outline-none
                   placeholder:text-zinc-500
                   shadow-[0_0_15px_rgba(59,130,246,0.1)]
                   focus:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
        />
      </div>
      
      <Button
        type="submit"
        disabled={isLoading}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20
                 bg-gradient-to-r from-blue-500 to-teal-500 
                 hover:opacity-90 transition-all duration-300
                 rounded-full px-6 py-2 text-white font-medium
                 disabled:opacity-50 disabled:cursor-not-allowed
                 shadow-[0_2px_8px_rgba(59,130,246,0.25)]
                 hover:shadow-[0_4px_12px_rgba(59,130,246,0.35)]
                 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? 'Processing...' : 'Send'}
      </Button>
    </form>
  );
} 
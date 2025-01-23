import { Button } from '../ui/Button';

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function QueryInput({ value, onChange, onSubmit, isLoading }: QueryInputProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask WebRover anything..."
        className="w-full p-4 pr-24 rounded-lg bg-zinc-800/50 border border-zinc-700 
                 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                 transition-colors outline-none"
      />
      <Button
        type="submit"
        disabled={isLoading}
        className="absolute right-2 top-2"
      >
        {isLoading ? 'Processing...' : 'Send'}
      </Button>
    </form>
  );
}
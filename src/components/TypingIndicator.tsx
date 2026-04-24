import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-300 flex items-center justify-center">
        <Bot className="w-4 h-4 text-text-300" />
      </div>
      <div className="bg-bg-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-input border border-bg-300">
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-2 h-2 bg-text-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-text-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-text-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

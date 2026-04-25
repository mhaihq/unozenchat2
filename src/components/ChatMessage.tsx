import type { Message } from "../lib/types";

interface Props {
  message: Message;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
        isUser ? "bg-primary-700 text-white" : "bg-charcoal-200 text-charcoal-700"
      }`}>
        {isUser ? "U" : "AI"}
      </div>

      <div className={`max-w-[78%] rounded-sage-lg px-3.5 py-2.5 text-sm leading-relaxed ${
        isUser
          ? "bg-primary-700 text-white"
          : "bg-bg-100 text-text-100 border border-bg-300 shadow-sage-sm"
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1.5 ${isUser ? "text-primary-200" : "text-text-500"}`}>
          {message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

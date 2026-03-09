"use client";
/**
 * FILE:    frontend/src/components/layout/AIChatBubble.tsx
 * PURPOSE: Floating "Ask AI" bubble — fixed bottom-right on every page.
 *          Navigates to /chatbot on click. Hidden on the chatbot page itself.
 *          Pulses once on first render to draw attention.
 */
import { usePathname, useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function AIChatBubble() {
  const pathname   = usePathname();
  const router     = useRouter();
  const [visible,  setVisible]  = useState(false);
  const [pulsed,   setPulsed]   = useState(false);
  const [hovered,  setHovered]  = useState(false);

  // Hide on the chatbot page itself
  const isChatbot = pathname === "/chatbot";

  // Fade in after 800ms so it doesn't flash on first paint
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Pulse animation once after appearing
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setPulsed(true), 400);
    return () => clearTimeout(t);
  }, [visible]);

  if (isChatbot) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2",
        "transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      {/* Tooltip label — shown on hover */}
      <div className={cn(
        "bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-xl",
        "shadow-lg pointer-events-none whitespace-nowrap",
        "transition-all duration-200",
        hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
      )}>
        Search properties with AI ✨
      </div>

      {/* Bubble button */}
      <button
        onClick={() => router.push("/chatbot")}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Open AI property search"
        className={cn(
          // Base shape
          "relative flex items-center gap-2.5 pl-4 pr-5 h-14 rounded-full",
          // Background gradient
          "bg-gradient-to-br from-brand-500 to-brand-600",
          // Shadow + hover elevation
          "shadow-[0_4px_24px_rgba(79,110,247,0.45)]",
          "hover:shadow-[0_6px_32px_rgba(79,110,247,0.65)]",
          "hover:-translate-y-0.5",
          // Smooth transitions
          "transition-all duration-200 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",
        )}
      >
        {/* Ping ring — draws attention once */}
        {pulsed && (
          <span className="absolute inset-0 rounded-full animate-ping
                           bg-brand-400 opacity-20 pointer-events-none" />
        )}

        {/* Icon */}
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center
                        justify-center flex-shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>

        {/* Label */}
        <span className="text-white text-sm font-semibold tracking-wide pr-0.5">
          Ask AI
        </span>
      </button>
    </div>
  );
}
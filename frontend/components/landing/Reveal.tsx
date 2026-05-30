"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className = "" }: Props) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={[
        "reveal",
        visible ? "visible" : "",
        delay ? `reveal-d${delay}` : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

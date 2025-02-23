import type { ReactNode } from "react";

interface FrameProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  titleSize?: "lg" | "md" | "sm";
  minHeight?: string;
}

export default function Frame({
  title,
  children,
  className = "",
  titleSize = "md",
  minHeight = "",
}: FrameProps) {
  const titleClassName =
    titleSize === "lg"
      ? "text-xl md:text-2xl -top-9 md:-top-10"
      : titleSize === "md"
        ? "text-lg md:text-xl -top-9 md:-top-9"
        : "text-base md:text-lg -top-8 md:-top-9";

  return (
    <div className={`relative ${className}`}>
      <p
        className={`absolute left-6 font-bold bg-white px-2 py-1 translate-y-1/2 z-10 ${titleClassName}`}
      >
        {title}
      </p>
      <div className={`rounded-xl border-2 border-black ${minHeight}`}>
        {children}
      </div>
    </div>
  );
}

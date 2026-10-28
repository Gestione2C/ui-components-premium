"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  staggerDelay = 0.2,
  compact = false,
  wordClassName,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  /** seconds between words (default 0.2) */
  staggerDelay?: number;
  /** drop the default top margin / large type so it can be used for body copy */
  compact?: boolean;
  wordClassName?: string;
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");
  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(staggerDelay),
      }
    );
  }, [scope.current]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className={cn("dark:text-white text-black opacity-0", wordClassName)}
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn(!compact && "font-bold", className)}>
      <div className={cn(!compact && "mt-4")}>
        <div className={cn("dark:text-white text-black leading-snug", !compact && "text-2xl tracking-wide")}>
          {renderWords()}
        </div>
      </div>
    </div>
  );
};

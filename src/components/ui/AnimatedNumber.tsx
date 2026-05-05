"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export function AnimatedNumber({
  value,
  formatter = (v: number) => v.toLocaleString(),
  duration = 0.8,
}: {
  value: number;
  formatter?: (v: number) => string;
  duration?: number;
}) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (latest) => formatter(Math.round(latest)));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [value, duration, motionValue]);

  return <motion.span>{display}</motion.span>;
}
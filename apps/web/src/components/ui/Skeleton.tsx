import { useEffect, useState } from 'react';
import type { FC } from 'react';

interface SkeletonProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Border radius */
  radius?: string | number;
  /** Animation type: 'pulse' or 'wave' */
  animation?: 'pulse' | 'wave';
  /** Whether to render as circle */
  circle?: boolean;
}

/**
 * Skeleton loader component for showing loading placeholders
 */
export const Skeleton: FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  radius = '0.25rem',
  animation = 'wave',
  circle = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shift_2s_linear_infinite]',
  };

  return (
    <div
      className={`block ${animationClasses[animation]} rounded-${circle ? 'full' : typeof radius === 'number' ? `${radius}` : radius}
        bg-gray-200 ${typeof width === 'number' ? `w-[${width}px]` : `w-${width}`}
        ${typeof height === 'number' ? `h-[${height}px]` : `h-${height}`}
      `}
    />
  );
};
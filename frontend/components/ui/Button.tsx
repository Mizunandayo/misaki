'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant
  size?: Size
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[var(--color-ember-500)] text-[var(--color-ink-950)] font-semibold ' +
    'hover:bg-[var(--color-ember-400)] active:bg-[var(--color-ember-600)]',
  secondary:
    'bg-transparent text-[var(--color-paper-50)] border border-[var(--color-ink-600)] ' +
    'hover:border-[var(--color-ember-500)] hover:text-[var(--color-ember-500)]',
  ghost:
    'bg-transparent text-[var(--color-paper-100)] ' +
    'hover:text-[var(--color-ember-500)]',
}

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const reduce = useReducedMotion()

    return (
      <motion.button
        ref={ref}
        whileHover={reduce ? undefined : { y: -1 }}
        whileTap={reduce ? undefined : { y: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        className={cn(
          'cursor-pointer select-none inline-flex items-center justify-center gap-2',
          'rounded-md transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-[var(--color-ember-500)] focus-visible:outline-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'

import type { Transition, Variants } from 'framer-motion'

export const easeOutExpo: Transition = {
    duration: 0.7,
    ease: [0.16, 1, 0.3, 1],
}

export const spring: Transition ={
    type: 'spring',
    stiffness: 300,
    damping: 24,
    mass: 0.6,
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: easeOutExpo },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: easeOutExpo },
}
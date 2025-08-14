import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    img: 'img',
    button: 'button',
    span: 'span',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock CSS variables that might not be available in test environment
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => {
      if (prop.startsWith('--bn-')) {
        return '#000000' // Default color for Blue Note variables
      }
      return ''
    },
  }),
})

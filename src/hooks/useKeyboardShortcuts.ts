import { useEffect } from 'react'
import { VinylRecord } from '../data/vinylRecords'

interface UseKeyboardShortcutsProps {
  showRandomPicker: boolean
  selectedRecord: VinylRecord | null
  onRandomPick: () => void
}

export function useKeyboardShortcuts({
  showRandomPicker,
  selectedRecord,
  onRandomPick,
}: UseKeyboardShortcutsProps) {
  // Keyboard shortcut for Jazz Roulette (R key)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if not typing in an input field and not in a modal
      if (
        (event.key === 'r' || event.key === 'R') &&
        !showRandomPicker &&
        !selectedRecord &&
        event.target instanceof HTMLElement &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)
      ) {
        event.preventDefault()
        onRandomPick()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [showRandomPicker, selectedRecord, onRandomPick])
}

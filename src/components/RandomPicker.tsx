import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, X } from "lucide-react";
import { VinylRecord } from "../data/vinylRecords";
import { getRandomSuggestion } from "../utils/randomPicker";
import { VinylCard } from "./VinylCard";

interface RandomPickerProps {
  records: VinylRecord[];
  currentGenre?: string | null;
  currentDecade?: string | null;
  onRecordSelect: (record: VinylRecord) => void;
  onFilter: (type: string, value: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function RandomPicker({ 
  records, 
  currentGenre, 
  currentDecade, 
  onRecordSelect, 
  onFilter,
  onClose, 
  isOpen 
}: RandomPickerProps) {
  // Get random colors for spinning vinyl (with transparency for better groove visibility)
  const getRandomVinylColors = () => {
    const colors = [
      'rgba(0, 196, 204, 0.75)', // electric-teal
      'rgba(255, 107, 0, 0.75)',   // vibrant-orange
      'rgba(30, 58, 138, 0.75)',   // deep-blue
      'rgba(147, 51, 234, 0.75)',  // rich-purple
      'rgba(255, 193, 7, 0.75)',   // bright-yellow
      'rgba(236, 72, 153, 0.75)',  // magenta
      'rgba(59, 130, 246, 0.75)',  // classic-blue
      'rgba(34, 197, 94, 0.75)',   // forest-green
      'rgba(6, 182, 212, 0.75)',   // turquoise
      'rgba(239, 68, 68, 0.75)',   // coral-red
      'rgba(168, 85, 247, 0.75)',  // royal-purple
      'rgba(251, 146, 60, 0.75)'   // sunset-orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VinylRecord | null>(null);
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [resultPhrase, setResultPhrase] = useState("");
  const [vinylColor, setVinylColor] = useState(() => getRandomVinylColors());

  // Mystical phrases during spinning
  const mysticalPhrases = [
    "The Music Gods are consulting...",
    "Channeling sonic wisdom...",
    "Divining the perfect groove...",
    "The vinyl spirits whisper...",
    "Ancient melodies align...",
    "Jazz frequencies converging...",
    "The cosmic needle drops...",
    "Harmonies seek their vessel..."
  ];

  // Vibes/analog themed result phrases
  const resultPhrases = [
    "Here is your dose of vibes",
    "Your analog moment awaits",
    "Fresh vibes, served analog",
    "This vibe chose you", 
    "Analog magic, just for you",
    "Pure vinyl energy delivered",
    "Your sonic destiny revealed",
    "Handpicked analog goodness"
  ];

  // Get colors for selected record (similar to VinylCard)
  const getRecordColors = (record: VinylRecord) => {
    const colorSchemes = [
      { primary: 'var(--bn-electric-teal)', accent: 'var(--bn-bright-yellow)' },
      { primary: 'var(--bn-vibrant-orange)', accent: 'var(--bn-electric-teal)' },
      { primary: 'var(--bn-deep-blue)', accent: 'var(--bn-bright-yellow)' },
      { primary: 'var(--bn-rich-purple)', accent: 'var(--bn-vibrant-orange)' },
      { primary: 'var(--bn-bright-yellow)', accent: 'var(--bn-electric-teal)' },
    ];
    const schemeIndex = parseInt(record.id) % colorSchemes.length;
    return colorSchemes[schemeIndex];
  };

  const handleSpin = async () => {
    if (isSpinning || records.length === 0) return;

    setIsSpinning(true);
    setSelectedRecord(null);
    setVinylColor(getRandomVinylColors());
    
    // Pick one random mystical phrase for the entire spin
    const randomPhrase = mysticalPhrases[Math.floor(Math.random() * mysticalPhrases.length)];
    setCurrentPhrase(randomPhrase);

    // Simulate spinning time (2.5 seconds)
    setTimeout(() => {
      const result = getRandomSuggestion({
        mode: 'feeling-lucky',
        records,
        currentGenre,
        currentDecade,
        excludeRecent: true
      });

      if (result) {
        setSelectedRecord(result.record);
        // Pick random result phrase
        const randomResultPhrase = resultPhrases[Math.floor(Math.random() * resultPhrases.length)];
        setResultPhrase(randomResultPhrase);
      }
      
      setIsSpinning(false);
    }, 2500);
  };

  const handleRecordClick = () => {
    if (selectedRecord) {
      onRecordSelect(selectedRecord);
      onClose();
    }
  };

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setIsSpinning(false);
      setSelectedRecord(null);
      setCurrentPhrase("");
      setResultPhrase("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const colors = selectedRecord ? getRecordColors(selectedRecord) : { primary: 'var(--bn-electric-teal)', accent: 'var(--bn-bright-yellow)' };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, 
            rgba(15, 23, 42, 0.85) 0%, 
            rgba(30, 58, 138, 0.75) 25%, 
            rgba(26, 40, 71, 0.80) 50%, 
            rgba(15, 23, 42, 0.85) 75%, 
            rgba(15, 23, 41, 0.90) 100%)`
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative p-8 w-full overflow-visible"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.4) 0%, rgba(30, 58, 138, 0.2) 60%, transparent 100%)'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Enhanced full-screen background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Large floating vinyl records */}
            <motion.div
              className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-8 border-8 border-white/5"
              style={{ backgroundColor: colors.primary }}
              animate={{
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8],
                x: [0, -50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Record grooves for background vinyl */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 rounded-full border border-white/10 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: `${(i + 2) * 60}px`,
                    height: `${(i + 2) * 60}px`,
                  }}
                />
              ))}
            </motion.div>

            {/* Geometric Blue Note shapes */}
            <motion.div
              className="absolute top-1/4 -left-48 opacity-12"
              style={{ 
                width: 0,
                height: 0,
                borderLeft: '300px solid transparent',
                borderRight: '300px solid transparent',
                borderBottom: `350px solid ${colors.primary}`,
              }}
              animate={{
                rotate: [0, 15, 0],
                scale: [1, 1.3, 1],
                x: [0, 60, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Bottom right vinyl */}
            <motion.div
              className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full opacity-8 border-6 border-white/5"
              style={{ backgroundColor: colors.accent }}
              animate={{
                rotate: [0, -360],
                scale: [1, 1.2, 1],
                x: [0, -40, 0],
              }}
              transition={{
                duration: 35,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Additional geometric pattern */}
            <motion.div
              className="absolute bottom-1/3 -right-32 w-80 h-80 opacity-6"
              style={{ 
                backgroundColor: colors.accent,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)"
              }}
              animate={{
                rotate: [0, 120, 0],
                scale: [1, 0.7, 1],
              }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Top left accent shape */}
            <motion.div
              className="absolute top-32 -left-32 w-72 h-72 opacity-10"
              style={{ 
                backgroundColor: colors.primary,
                borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%'
              }}
              animate={{
                rotate: [0, 45, 0],
                scale: [1, 1.1, 1],
                borderRadius: [
                  '30% 70% 70% 30% / 30% 30% 70% 70%',
                  '70% 30% 30% 70% / 70% 70% 30% 30%',
                  '30% 70% 70% 30% / 30% 30% 70% 70%'
                ]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Subtle texture overlay */}
            <div 
              className="absolute inset-0 opacity-3"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.primary} 2px, transparent 2px), radial-gradient(circle at 75% 75%, ${colors.accent} 1px, transparent 1px)`,
                backgroundSize: '120px 120px, 80px 80px'
              }}
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <motion.h2 
              className="text-3xl font-black tracking-tight text-white mb-4"
              key={`${isSpinning}-${currentPhrase}-${selectedRecord?.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isSpinning ? currentPhrase : selectedRecord ? resultPhrase : "In the mood for something?"}
            </motion.h2>
            <div 
              className="w-24 h-1 mx-auto rounded-full mb-4"
              style={{ backgroundColor: colors.accent }}
            />
          </div>


          {/* Vinyl spinning area - fixed container to prevent bouncing */}
          <div className="relative mb-8 flex flex-col items-center">
            {/* Fixed container to prevent UI bouncing */}
            <div className="w-80 h-80 mb-6 relative">
              {/* Spinning vinyl record - only show when spinning or no record selected */}
              {(!selectedRecord || isSpinning) && (
                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden cursor-pointer"
                  onClick={!isSpinning ? handleSpin : undefined}
                  animate={isSpinning ? { rotate: [0, 360 * 8] } : {}}
                  transition={isSpinning ? { 
                    duration: 2.5, 
                    ease: [0.25, 0.1, 0.25, 1] // Starts fast, slows dramatically
                  } : {}}
                  style={{ 
                    backgroundColor: vinylColor,
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.6),
                      0 0 0 4px rgba(255, 255, 255, 0.1),
                      0 0 0 8px ${vinylColor}40
                    `
                  }}
              >
                {/* Record grooves - enhanced visibility */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 rounded-full border transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: `${(i + 3) * 12}px`,
                      height: `${(i + 3) * 12}px`,
                      borderColor: i % 2 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)',
                      borderWidth: i % 2 === 0 ? '1px' : '0.5px',
                      boxShadow: i % 2 === 0 ? 'inset 0 0 2px rgba(0, 0, 0, 0.2)' : 'none'
                    }}
                  />
                ))}

                {/* Center label */}
                <div 
                  className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    backgroundColor: 'white',
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                />

                {/* Center hole */}
                <div 
                  className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    backgroundColor: 'var(--bn-deep-black)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.8)'
                  }}
                />

                {/* Vinyl shine effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0deg, rgba(255, 255, 255, 0.1) 45deg, transparent 90deg, rgba(255, 255, 255, 0.05) 180deg, transparent 270deg)`,
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />

              </motion.div>
              )}
              
              {/* VinylCard display - positioned in same container space */}
              {selectedRecord && !isSpinning && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  <div style={{
                    boxShadow: `
                      0 25px 50px rgba(0, 0, 0, 0.8),
                      0 15px 35px rgba(0, 0, 0, 0.6),
                      0 8px 25px rgba(0, 0, 0, 0.4),
                      0 0 0 1px rgba(255, 255, 255, 0.1)
                    `,
                    borderRadius: '8px'
                  }}>
                    <VinylCard
                      record={selectedRecord}
                      index={0}
                      onClick={handleRecordClick}
                      onFilter={onFilter}
                      disableOverlay={true}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Buttons - Spin button or Action buttons */}
            {!selectedRecord ? (
              <motion.button
                onClick={handleSpin}
                disabled={isSpinning || records.length === 0}
                className="flex items-center space-x-3 px-8 py-4 rounded-sm font-black tracking-wide uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.primary,
                  color: 'white'
                }}
                whileHover={!isSpinning ? { 
                  scale: 1.05,
                  backgroundColor: colors.accent
                } : {}}
                whileTap={!isSpinning ? { scale: 0.95 } : {}}
              >
                <Shuffle className="w-6 h-6" />
                <span>
                  {isSpinning ? 'SPINNING...' : records.length === 0 ? 'NO RECORDS' : 'SPIN THE COLLECTION'}
                </span>
              </motion.button>
            ) : (
              <motion.div
                className="flex justify-center mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  onClick={handleSpin}
                  className="flex items-center space-x-3 px-6 py-3 rounded-sm font-bold uppercase text-white transition-all duration-200"
                  style={{ backgroundColor: 'var(--bn-electric-teal)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bn-deep-blue)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bn-electric-teal)';
                  }}
                >
                  <Shuffle className="w-5 h-5" />
                  <span>Spin Again</span>
                </button>
              </motion.div>
            )}

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
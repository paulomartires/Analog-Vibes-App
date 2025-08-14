import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SyncProgress } from "../services/cacheService";

interface LoadingScreenProps {
  progress?: SyncProgress | null;
  message?: string;
  onBackToCollection?: () => void;
  showBackButton?: boolean;
}

export function LoadingScreen({ progress, message, onBackToCollection, showBackButton }: LoadingScreenProps) {
  const progressValue = progress?.progress || 0;
  const phase = progress?.phase || 'loading';

  // Witty cocktail-themed messages based on sync phase
  const getWittyMessage = (phase: string, customMessage?: string) => {
    if (customMessage) return customMessage;
    
    const messages = {
      connecting: [
        "Getting the vibes from Discogs... Chill and grab a cocktail 🍸",
        "Establishing the connection... Time to pour something smooth 🥃",
        "Dialing into the jazz frequency... Mix yourself a martini 🍷"
      ],
      fetching: [
        "Spinning up your collection... Time for a martini break 🍷", 
        "Digging through the crates... Pour yourself something smooth 🥃",
        "Collecting those Blue Note treasures... Sip and savor ☕",
        "Hunting for vinyl gold... Let that whiskey breathe 🥃"
      ],
      transforming: [
        "Syncing the groove... Let that vinyl breathe while you sip ☕",
        "Dropping the needle on your data... Time for a cocktail break 🍸",
        "Finding the perfect tempo... Pour yourself a nightcap 🥃",
        "Polishing those jazz gems... Enjoy a smooth Old Fashioned 🥃"
      ],
      caching: [
        "Storing the magic... Let that record spin and relax 🍷",
        "Preserving the vibes... Perfect time for a coffee break ☕",
        "Saving your sonic treasures... Sip something special 🍸",
        "Caching the cool... Time for one more drink 🥃"
      ],
      complete: [
        "Collection ready! Hope you enjoyed your drink 🎷",
        "All set! Was that cocktail as smooth as your jazz? 🍸",
        "Done! Time to enjoy your vinyl with a refill 🍷"
      ],
      error: [
        "Oops! The record skipped... Maybe try a different cocktail? 🍸",
        "Something went off-beat... Pour a strong one and try again 🥃"
      ],
      loading: [
        "Getting the vibes from Discogs... Chill and grab a cocktail 🍸",
        "Loading your analog treasures... Pour something neat 🥃"
      ]
    };

    const phaseMessages = messages[phase as keyof typeof messages] || messages.loading;
    return phaseMessages[Math.floor(Math.random() * phaseMessages.length)];
  };

  const displayMessage = getWittyMessage(phase, message);

  // Use consistent teal color throughout
  const phaseColor = 'var(--bn-electric-teal)';

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, 
          var(--bn-navy) 0%, 
          var(--bn-deep-blue) 25%, 
          #1a2847 50%, 
          var(--bn-navy) 75%, 
          #0f1729 100%)`
      }}
    >
      {/* Enhanced Blue Note background animations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating vinyl records in background */}
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-8 border-8 border-white/5"
          style={{ backgroundColor: phaseColor }}
          animate={{
            rotate: [0, 360],
            scale: [0.8, 1.1, 0.8],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Record grooves */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 rounded-full border border-white/10 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: `${(i + 1) * 60}px`,
                height: `${(i + 1) * 60}px`,
              }}
            />
          ))}
          {/* Center hole */}
          <div className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-black/40 transform -translate-x-1/2 -translate-y-1/2" />
        </motion.div>

        {/* Triangular Blue Note shapes */}
        <motion.div
          className="absolute top-1/3 -left-32 opacity-12"
          style={{ 
            width: 0,
            height: 0,
            borderLeft: '200px solid transparent',
            borderRight: '200px solid transparent',
            borderBottom: `250px solid ${phaseColor}`,
          }}
          animate={{
            rotate: [0, 10, 0],
            scale: [1, 1.2, 1],
            x: [0, 40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />


        {/* Small floating vinyl record */}
        <motion.div
          className="absolute bottom-20 left-1/4 w-32 h-32 rounded-full opacity-8 border-4 border-white/5"
          style={{ backgroundColor: phaseColor }}
          animate={{
            rotate: [0, -360],
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-black/40 transform -translate-x-1/2 -translate-y-1/2" />
        </motion.div>

        {/* Blue Note geometric pattern */}
        <motion.div
          className="absolute bottom-1/4 -right-24 w-48 h-48 opacity-6"
          style={{ 
            backgroundColor: phaseColor,
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)"
          }}
          animate={{
            rotate: [0, 90, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle texture overlay */}
        <div 
          className="absolute inset-0 opacity-2"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${phaseColor} 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Back to Collection Button */}
      {showBackButton && onBackToCollection && (
        <nav className="fixed top-0 left-0 right-0 z-50 p-8">
          <button
            onClick={onBackToCollection}
            className="flex items-center space-x-3 px-6 py-3 font-black tracking-wide uppercase border-2 text-white hover:text-bn-electric-teal hover:border-bn-electric-teal transition-colors duration-300 rounded-sm"
            style={{
              background: 'rgba(30, 58, 138, 0.2)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Collection</span>
          </button>
        </nav>
      )}

      {/* Main loading content */}
      <div className="relative z-10 text-center px-8 max-w-md">
        {/* Enhanced vinyl record animation */}
        <div className="mb-12 relative">
          {/* Record shadow */}
          <div 
            className="absolute top-2 left-1/2 transform -translate-x-1/2 w-36 h-36 rounded-full opacity-30 blur-lg"
            style={{ backgroundColor: 'var(--bn-deep-black)' }}
          />
          
          {/* Main vinyl record */}
          <motion.div
            className="w-36 h-36 mx-auto rounded-full relative overflow-hidden"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            style={{ 
              backgroundColor: '#1a1a1a',
              boxShadow: `
                0 8px 25px rgba(0, 0, 0, 0.6),
                0 4px 12px rgba(0, 0, 0, 0.4),
                inset 0 1px 3px rgba(255, 255, 255, 0.1),
                0 0 0 3px rgba(255, 255, 255, 0.1)
              `
            }}
          >
            {/* Record grooves - more realistic */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 rounded-full border transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: `${(i + 3) * 10}px`,
                  height: `${(i + 3) * 10}px`,
                  borderColor: i % 2 === 0 ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                  borderWidth: '0.5px'
                }}
              />
            ))}

            {/* Record label area */}
            <div 
              className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ 
                backgroundColor: phaseColor,
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Blue Note inspired label text */}
              <div className="text-xs font-black text-white/90 text-center leading-tight">
                <div>BLUE</div>
                <div>NOTE</div>
              </div>
            </div>
            
            {/* Center hole */}
            <div 
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2"
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
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* Stylus/Needle */}
          <div className="absolute top-6 right-2 w-20 h-1 origin-left transform rotate-45">
            {/* Tonearm */}
            <div 
              className="w-16 h-0.5 rounded-full"
              style={{ backgroundColor: 'var(--bn-electric-teal)' }}
            />
            {/* Stylus tip */}
            <motion.div 
              className="absolute right-0 top-1/2 w-1 h-1 rounded-full transform -translate-y-1/2"
              style={{ backgroundColor: 'var(--bn-bright-yellow)' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Musical notes floating around */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                color: phaseColor,
                top: '50%',
                left: '50%',
                transformOrigin: '0 0',
              }}
              animate={{
                rotate: [0, 360],
                scale: [0.3, 0.8, 0.3],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut",
              }}
              initial={{
                x: 100 * Math.cos((i * Math.PI * 2) / 6),
                y: 100 * Math.sin((i * Math.PI * 2) / 6),
              }}
            >
              {['♪', '♫', '♬', '♩', '♭', '♯'][i]}
            </motion.div>
          ))}
        </div>

        {/* Enhanced Blue Note loading text */}
        <motion.h2
          className="text-4xl font-black tracking-tight mb-6 text-white"
          style={{ 
            fontStretch: "condensed",
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            letterSpacing: "-0.02em"
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {phase === 'error' ? 'JAZZ INTERRUPTED' : 'ANALOG VIBES'}
        </motion.h2>

        {/* Subtitle with jazz terminology */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div 
            className="w-16 h-0.5 mx-auto mb-4"
            style={{ backgroundColor: phaseColor }}
          />
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">
            {phase === 'connecting' && 'Establishing Connection'}
            {phase === 'fetching' && 'Digging Through Crates'}
            {phase === 'transforming' && 'Finding The Groove'}
            {phase === 'caching' && 'Preserving The Magic'}
            {phase === 'complete' && 'Ready To Spin'}
            {phase === 'error' && 'Record Skipped'}
            {(!phase || phase === 'loading') && 'Loading Collection'}
          </p>
        </motion.div>

        <motion.p
          className="text-lg font-medium text-white/80 mb-8 min-h-[1.5rem] leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          key={displayMessage} // Re-animate when message changes
        >
          {displayMessage}
        </motion.p>

        {/* Enhanced Blue Note progress bar */}
        {progress && progressValue > 0 && (
          <div className="mb-8">
            {/* Progress bar with Blue Note styling */}
            <div className="relative w-full bg-white/10 rounded-sm h-3 mb-4 overflow-hidden">
              <motion.div
                className="h-3 rounded-sm relative overflow-hidden"
                style={{ backgroundColor: phaseColor }}
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Animated shine effect on progress bar */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              
              {/* Progress bar geometric accents */}
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                <div className="flex space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 h-2 bg-white/20"
                      style={{ opacity: progressValue > (i + 1) * 20 ? 1 : 0.3 }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="font-black uppercase tracking-wide text-white/70">
                {phase.replace(/([A-Z])/g, ' $1').toUpperCase()}
              </span>
              <span className="font-black text-white" style={{ color: phaseColor }}>
                {Math.round(progressValue)}%
              </span>
            </div>

            {/* Additional progress info with Blue Note styling */}
            {progress.recordsProcessed && progress.totalRecords && (
              <p className="text-sm text-white/60 mt-3 font-medium">
                <span style={{ color: phaseColor }}>{progress.recordsProcessed}</span>
                <span className="mx-2">of</span>
                <span>{progress.totalRecords}</span>
                <span className="ml-2 uppercase tracking-wide">records collected</span>
              </p>
            )}

            {progress.currentPage && progress.totalPages && (
              <p className="text-sm text-white/60 mt-1 font-medium">
                <span className="uppercase tracking-wide">Page</span>
                <span className="mx-2" style={{ color: phaseColor }}>{progress.currentPage}</span>
                <span>of {progress.totalPages}</span>
              </p>
            )}
          </div>
        )}

        {/* Enhanced Blue Note phase indicators */}
        <motion.div
          className="flex justify-center items-center space-x-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {['connecting', 'fetching', 'transforming', 'caching', 'complete'].map((phaseStep, index) => {
            const isActive = phase === phaseStep;
            const isCompleted = ['connecting', 'fetching', 'transforming', 'caching'].indexOf(phase) > index;
            
            return (
              <motion.div
                key={phaseStep}
                className="flex flex-col items-center"
                animate={{
                  scale: isActive ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: isActive ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                {/* Geometric Blue Note indicator */}
                <div
                  className="w-4 h-4 relative"
                  style={{
                    backgroundColor: isActive || isCompleted ? phaseColor : 'rgba(255, 255, 255, 0.2)',
                    clipPath: index % 2 === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                    borderRadius: index % 2 !== 0 ? '50%' : '0'
                  }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: phaseColor,
                        clipPath: index % 2 === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                        borderRadius: index % 2 !== 0 ? '50%' : '0'
                      }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </div>
                
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
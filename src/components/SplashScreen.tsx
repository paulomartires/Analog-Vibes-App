import { motion } from "framer-motion";
import { AppIcon } from "./AppIcon";

interface SplashScreenProps {
  message?: string;
  progress?: number;
}

export function SplashScreen({ message = "Loading Analog Vibes...", progress }: SplashScreenProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ 
        background: `linear-gradient(135deg, 
          var(--bn-navy) 0%, 
          var(--bn-deep-blue) 25%, 
          #1a2847 50%, 
          var(--bn-navy) 75%, 
          #0f1729 100%)`
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--bn-electric-teal)' }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 -right-32 w-48 h-48 opacity-8"
          style={{ backgroundColor: 'var(--bn-bright-yellow)' }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Spinning Vinyl Record */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          className="relative"
        >
          <AppIcon size={120} className="drop-shadow-2xl" />
        </motion.div>

        {/* App Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center"
        >
          <h1 
            className="text-5xl font-black tracking-tight text-white mb-2"
            style={{ 
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.8)' 
            }}
          >
            ANALOG VIBES
          </h1>
          <p 
            className="text-xl font-medium text-white/80 tracking-wide"
            style={{ 
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.6)' 
            }}
          >
            Vinyl Collection
          </p>
        </motion.div>

        {/* Loading Message & Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-lg font-medium text-white/90 tracking-wide">
            {message}
          </p>

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="w-80 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-bn-electric-teal to-bn-bright-yellow rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          )}

          {/* Pulsing Dots */}
          {progress === undefined && (
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/60"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 text-sm text-white/50 font-medium"
        >
          v1.0.0
        </motion.p>
      </div>
    </div>
  );
}
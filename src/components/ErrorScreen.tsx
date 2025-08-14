import { motion } from "framer-motion";

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
  onClearCache?: () => void;
  showConfigHelp?: boolean;
}

export function ErrorScreen({ error, onRetry, onClearCache, showConfigHelp = false }: ErrorScreenProps) {
  const isConfigError = error.includes('token') || error.includes('username') || error.includes('credentials');

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
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-8"
          style={{ backgroundColor: "var(--bn-crimson)" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main error content */}
      <div className="relative z-10 text-center px-8 max-w-lg">
        {/* Error icon */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4"
            style={{ 
              borderColor: 'var(--bn-crimson)',
              backgroundColor: 'rgba(220, 38, 38, 0.1)'
            }}
          >
            <motion.div
              className="text-4xl font-black"
              style={{ color: 'var(--bn-crimson)' }}
              animate={{ 
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              !
            </motion.div>
          </div>
        </motion.div>

        {/* Error title */}
        <motion.h2
          className="text-3xl font-black tracking-tight mb-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {isConfigError ? 'CONFIGURATION ERROR' : 'CONNECTION ERROR'}
        </motion.h2>

        {/* Error message */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg font-medium text-white/80 mb-4">
            {error}
          </p>

          {/* Configuration help */}
          {(isConfigError || showConfigHelp) && (
            <motion.div
              className="text-left bg-white/5 rounded-sm p-6 border border-white/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Setup Instructions:</h3>
              <ol className="text-sm text-white/70 space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://www.discogs.com/settings/developers" target="_blank" rel="noopener noreferrer" className="text-bn-electric-teal hover:underline">Discogs Developer Settings</a></li>
                <li>Generate a Personal Access Token</li>
                <li>Copy your Discogs username</li>
                <li>Edit the <code className="bg-white/10 px-2 py-1 rounded text-bn-bright-yellow">.env</code> file in your project</li>
                <li>Set <code className="bg-white/10 px-2 py-1 rounded text-bn-bright-yellow">VITE_DISCOGS_PERSONAL_ACCESS_TOKEN</code></li>
                <li>Set <code className="bg-white/10 px-2 py-1 rounded text-bn-bright-yellow">VITE_DISCOGS_USERNAME</code></li>
                <li>Restart the development server</li>
              </ol>
            </motion.div>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {onRetry && (
            <motion.button
              onClick={onRetry}
              className="px-8 py-4 rounded-sm font-black text-lg tracking-wide uppercase transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--bn-electric-teal)', 
                color: 'var(--bn-deep-black)' 
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'var(--bn-vibrant-orange)',
                boxShadow: "0 8px 32px rgba(0, 196, 204, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          )}

          {onClearCache && (
            <motion.button
              onClick={onClearCache}
              className="px-8 py-4 rounded-sm font-bold text-lg tracking-wide uppercase transition-all duration-300 border-2"
              style={{ 
                borderColor: 'var(--bn-cool-gray)',
                color: 'var(--bn-cool-gray)',
                backgroundColor: 'transparent'
              }}
              whileHover={{ 
                scale: 1.05,
                borderColor: 'var(--bn-crimson)',
                color: 'var(--bn-crimson)',
                backgroundColor: 'rgba(220, 38, 38, 0.1)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Cache
            </motion.button>
          )}
        </motion.div>

        {/* Additional help text */}
        <motion.p
          className="mt-8 text-sm text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Check the browser console for detailed error information
        </motion.p>
      </div>
    </div>
  );
}
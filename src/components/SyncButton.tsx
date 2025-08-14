import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface SyncButtonProps {
  onSync: (forceRefresh?: boolean) => Promise<void>;
  isLoading: boolean;
  lastSync?: Date | null;
  hasCache: boolean;
  className?: string;
}

export function SyncButton({ onSync, isLoading, lastSync, hasCache, className = "" }: SyncButtonProps) {
  const [showOptions, setShowOptions] = useState(false);

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowOptions(false);
    if (showOptions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showOptions]);

  const handleSync = async (forceRefresh = false) => {
    setShowOptions(false);
    await onSync(forceRefresh);
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Never synced";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Last sync info */}
      {lastSync && (
        <p className="text-xs text-white/60 mb-3 text-right">
          Last sync: {formatLastSync(lastSync)}
        </p>
      )}
      
      {/* Main sync button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          if (hasCache) {
            setShowOptions(!showOptions);
          } else {
            handleSync(false);
          }
        }}
        disabled={isLoading}
        className="flex items-center justify-center space-x-3 px-8 py-4 font-black text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ 
          backgroundColor: isLoading ? 'var(--bn-cool-gray)' : 'var(--bn-electric-teal)', 
          color: 'var(--bn-deep-black)',
          borderRadius: '0px',
          minWidth: '200px',
          height: '56px'
        }}
        whileHover={!isLoading ? { 
          backgroundColor: 'var(--bn-vibrant-orange)',
        } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
      >
        {/* Sync icon */}
        <motion.div
          className="w-5 h-5 border-2 border-current rounded-full border-t-transparent"
          animate={isLoading ? { rotate: 360 } : {}}
          transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        />
        
        <span>
          {isLoading ? 'SYNCING' : 'SYNC LIBRARY'}
        </span>

        {/* Arrow for dropdown */}
        {hasCache && (
          <motion.div
            className="w-0 h-0 ml-1"
            style={{
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '6px solid currentColor',
            }}
            animate={{ rotate: showOptions ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>

      {/* Dropdown options */}
      {showOptions && hasCache && (
        <motion.div
          className="absolute top-full right-0 mt-2 backdrop-blur-sm border border-white/20 overflow-hidden z-50 min-w-full"
          style={{
            background: "rgba(15, 23, 42, 0.9)",
            borderRadius: "0px",
            minWidth: "200px"
          }}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            onClick={() => handleSync(false)}
            className="w-full px-4 py-3 text-left text-white font-medium hover:bg-white/10 transition-colors duration-200"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div className="font-semibold">Quick Sync</div>
            <div className="text-xs text-white/70">Use cached data if available</div>
          </motion.button>

          <div className="border-t border-white/10" />

          <motion.button
            onClick={() => handleSync(true)}
            className="w-full px-4 py-3 text-left text-white font-medium hover:bg-white/10 transition-colors duration-200"
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div className="font-semibold">Full Refresh</div>
            <div className="text-xs text-white/70">Fetch fresh data from Discogs</div>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
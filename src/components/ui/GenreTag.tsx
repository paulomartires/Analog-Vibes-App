import { motion } from 'framer-motion'

interface GenreTagProps {
  genre: string
  onClick?: (genre: string) => void
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

export function GenreTag({ 
  genre, 
  onClick, 
  size = 'md', 
  interactive = true 
}: GenreTagProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const handleClick = () => {
    if (interactive && onClick) {
      onClick(genre)
    }
  }

  return (
    <motion.span
      className={`
        inline-flex items-center font-bold tracking-wide uppercase
        bg-white/10 hover:bg-bn-electric-teal/20 text-white
        rounded-sm border border-white/20 hover:border-bn-electric-teal/40
        backdrop-blur-sm transition-all duration-300
        ${sizeClasses[size]}
        ${interactive ? 'cursor-pointer hover:text-bn-electric-teal' : 'cursor-default'}
      `}
      onClick={handleClick}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      title={interactive ? `View all ${genre} records` : undefined}
    >
      {genre}
    </motion.span>
  )
}

interface GenreTagsProps {
  genres: string[]
  onGenreClick?: (genre: string) => void
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  maxTags?: number
  className?: string
}

export function GenreTags({ 
  genres, 
  onGenreClick, 
  size = 'md', 
  interactive = true,
  maxTags,
  className = ''
}: GenreTagsProps) {
  const displayGenres = maxTags ? genres.slice(0, maxTags) : genres
  const remainingCount = maxTags && genres.length > maxTags ? genres.length - maxTags : 0

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayGenres.map((genre, index) => (
        <GenreTag
          key={`${genre}-${index}`}
          genre={genre}
          onClick={onGenreClick}
          size={size}
          interactive={interactive}
        />
      ))}
      {remainingCount > 0 && (
        <span className={`
          inline-flex items-center font-bold tracking-wide
          text-white/60 text-${size === 'sm' ? 'xs' : size === 'lg' ? 'base' : 'sm'}
        `}>
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}
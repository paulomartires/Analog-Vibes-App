import { motion, AnimatePresence } from "framer-motion";
import { VinylRecord } from "../data/vinylRecords";
import { VinylCard } from "./VinylCard";

type FilterType = 'genre' | 'artist' | 'label' | 'year';

interface VinylGridProps {
  records: VinylRecord[];
  onRecordClick: (record: VinylRecord) => void;
  onFilter: (type: FilterType, value: string) => void;
}

export function VinylGrid({ records, onRecordClick, onFilter }: VinylGridProps) {
  return (
    <motion.div 
      className="grid grid-cols-3 gap-12"
      layout
    >
      <AnimatePresence mode="popLayout">
        {records.map((record, index) => (
          <motion.div
            key={record.id}
            layoutId={`vinyl-${record.id}`}
            initial={{ 
              opacity: 0, 
              scale: 0.9
            }}
            animate={{ 
              opacity: 1, 
              scale: 1
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9,
              transition: { duration: 0.2 }
            }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
              layout: { 
                duration: 0.4, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }}
          >
            <VinylCard
              record={record}
              index={index}
              onClick={() => onRecordClick(record)}
              onFilter={onFilter}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
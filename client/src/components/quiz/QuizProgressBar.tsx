import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface QuizProgressBarProps {
  current: number;
  total: number;
  score?: number;
  showScore?: boolean;
  stepLabel?: string;
}

export default function QuizProgressBar({ 
  current, 
  total, 
  score = 0, 
  showScore = true,
  stepLabel 
}: QuizProgressBarProps) {
  const progress = Math.min(((current + 1) / total) * 100, 100);
  const milestones = [25, 50, 75, 100];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {stepLabel || <>Question <span className="font-semibold text-foreground">{current + 1}</span> of {total}</>}
          </span>
        </div>
        
        {showScore && (
          <motion.div
            key={score}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full"
          >
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{score} pts</span>
          </motion.div>
        )}
      </div>
      
      <div className="relative">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </motion.div>
        </div>
        
        <div className="absolute inset-0 flex items-center">
          {milestones.map((milestone) => {
            const achieved = progress >= milestone;
            return (
              <div
                key={milestone}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${milestone}%` }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ 
                    scale: achieved ? 1 : 0.8, 
                    opacity: achieved ? 1 : 0.5 
                  }}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                    achieved 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "bg-background border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {milestone === 100 ? "✓" : ""}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-between mt-1 px-1">
        {milestones.map((milestone, idx) => (
          <span 
            key={milestone}
            className={`text-xs transition-colors ${
              progress >= milestone ? "text-primary font-medium" : "text-muted-foreground/50"
            }`}
            style={{ 
              position: idx === 0 ? "relative" : "absolute",
              left: idx === 0 ? "auto" : `${milestone}%`,
              transform: idx > 0 ? "translateX(-50%)" : "none"
            }}
          >
            {milestone}%
          </span>
        ))}
      </div>
    </div>
  );
}

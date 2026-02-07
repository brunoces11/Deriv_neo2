import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';

interface LoadingStep {
  text: string;
  duration: number; // in milliseconds
}

const LOADING_STEPS: LoadingStep[] = [
  { text: 'Analysing user intent...', duration: 1000 },
  { text: 'Fetching user data...', duration: 900 },
  { text: 'Gathering market data...', duration: 700 },
  { text: 'Building context...', duration: 1100 },
  { text: 'Building bot...', duration: 1300 },
  { text: 'Bot created!', duration: 1000 },
];

interface BotCreationLoaderProps {
  onComplete: () => void;
}

export function BotCreationLoader({ onComplete }: BotCreationLoaderProps) {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep >= LOADING_STEPS.length) {
      // All steps complete, wait a bit then call onComplete
      const timer = setTimeout(onComplete, 300);
      return () => clearTimeout(timer);
    }

    const step = LOADING_STEPS[currentStep];
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className={`p-6 space-y-3 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>
      {LOADING_STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isCurrent = index === currentStep;
        const isVisible = index <= currentStep;

        if (!isVisible) return null;

        return (
          <div
            key={index}
            className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300"
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              {isCompleted ? (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
              ) : null}
            </div>

            {/* Text */}
            <span
              className={`text-sm font-medium transition-colors duration-300 ${
                isCompleted
                  ? theme === 'dark'
                    ? 'text-zinc-500'
                    : 'text-gray-400'
                  : isCurrent
                  ? theme === 'dark'
                    ? 'text-zinc-200'
                    : 'text-gray-800'
                  : theme === 'dark'
                  ? 'text-zinc-400'
                  : 'text-gray-600'
              }`}
            >
              {step.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

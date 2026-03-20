
import React, { useState, useEffect, useRef } from 'react';
import { QuizStep as QuizStepType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

interface Props {
  step: QuizStepType;
  onSelect: (answer: string | string[]) => void;
  currentValue?: string | string[];
  onImageUpload?: (stepId: string, optionId: string, imageData: string) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

const QuizStep: React.FC<Props> = ({ step, onSelect, currentValue, onImageUpload, onBack, canGoBack }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [textValue, setTextValue] = useState<string>('');
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (step.isText) {
      setTextValue(typeof currentValue === 'string' ? currentValue : '');
    } else {
      if (Array.isArray(currentValue)) {
        setSelectedIds(currentValue);
      } else if (currentValue) {
        setSelectedIds([currentValue]);
      } else {
        setSelectedIds([]);
      }
    }
  }, [step.id, currentValue]);

  const toggleOption = (label: string) => {
    if (step.isMulti) {
      setSelectedIds(prev => 
        prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
      );
    } else {
      onSelect(label);
    }
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (textValue.trim()) {
      onSelect(textValue.trim());
    }
  };

  const isSelected = (label: string) => selectedIds.includes(label);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      {canGoBack && (
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 font-bold text-xs uppercase tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Назад
        </button>
      )}
      
      <div className="mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <span className="h-1 w-12 bg-orange-500 rounded-full"></span>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">
            {step.title}
          </h2>
        </motion.div>
        
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold serif text-white leading-tight"
        >
          {step.question}
        </motion.h3>

        {step.isMulti && !step.isText && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-500 mt-4 flex items-center gap-2 font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-orange-500" />
            Выберите один или несколько вариантов
          </motion.p>
        )}
      </div>

      {step.isText ? (
        <form onSubmit={handleTextSubmit} className="max-w-2xl">
          <div className="relative">
            <input
              autoFocus
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Введите название объекта..."
              className="w-full text-2xl md:text-4xl font-bold serif border-b-2 border-white/10 py-6 bg-transparent outline-none focus:border-orange-500 transition-all placeholder:text-white/10 placeholder:font-light text-white"
            />
            <AnimatePresence>
              {textValue.trim() && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button" 
                  onClick={() => setTextValue('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-12">
            <button
              type="submit"
              disabled={!textValue.trim()}
              className={`w-full md:w-auto px-16 py-6 rounded-full font-bold text-lg transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3
                ${textValue.trim() 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'}
              `}
            >
              Продолжить
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {step.options.map((option, index) => (
            <motion.div 
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <button
                onClick={() => toggleOption(option.label)}
                className={`
                  w-full relative flex flex-col items-start p-5 md:p-6 rounded-[2.5rem] border-2 text-left transition-all duration-500
                  ${isSelected(option.label)
                    ? 'border-orange-500 bg-orange-500 text-white shadow-2xl scale-[1.02] z-10' 
                    : 'border-white/5 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'}
                `}
              >
                {option.image && (
                  <div className="w-full aspect-[4/3] mb-6 overflow-hidden rounded-[2rem] bg-black/20 relative">
                    <img 
                      src={option.image} 
                      alt={option.label}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 transition-opacity duration-500 ${isSelected(option.label) ? 'bg-orange-500/20' : 'bg-black/0'}`} />
                  </div>
                )}
                <div className="flex justify-between w-full items-start px-1">
                  <div className="flex-1">
                    <span className="text-lg md:text-xl font-bold mb-1 block leading-tight">{option.label}</span>
                    {option.description && (
                      <span className={`text-xs block font-medium leading-relaxed ${isSelected(option.label) ? 'text-orange-100' : 'text-gray-500'}`}>
                        {option.description}
                      </span>
                    )}
                  </div>
                  {step.isMulti && (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ml-4 ${isSelected(option.label) ? 'bg-white border-white' : 'border-white/10'}`}>
                      {isSelected(option.label) && (
                        <Check className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {step.isMulti && !step.isText && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 mb-12 flex justify-center"
        >
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => onSelect(selectedIds)}
            className={`w-full md:w-auto px-10 md:px-20 py-4 md:py-6 rounded-full font-bold text-lg transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4
              ${selectedIds.length > 0 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-white/5 text-gray-600 cursor-not-allowed'}
            `}
          >
            Подтвердить выбор ({selectedIds.length})
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuizStep;

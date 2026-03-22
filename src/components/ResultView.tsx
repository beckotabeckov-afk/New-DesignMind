
import React, { useState } from 'react';
import { DesignResult } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import { 
  Printer, 
  Copy, 
  RefreshCw, 
  Plus, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  FileText, 
  Layout, 
  Image as ImageIcon,
  MessageSquare,
  X
} from 'lucide-react';

interface Props {
  result: DesignResult;
  onRestart: () => void;
  onRegenerate: (feedback: string) => Promise<void>;
}

const ResultView: React.FC<Props> = ({ result, onRestart, onRegenerate }) => {
  const [copied, setCopied] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.technicalAssignment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await onRegenerate(feedbackText);
    setIsRegenerating(false);
    setIsFeedbackOpen(false);
    setFeedbackText('');
  };

  const VisualCard = ({ url, title, type }: { url?: string, title: string, type: string }) => (
    <div className="bg-white rounded-[4rem] p-10 md:p-16 text-[#2C3E50] overflow-hidden shadow-lg relative mb-12 avoid-break border border-[#E8E2D9]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 order-2 lg:order-1">
          <div className="space-y-4">
            <span className="text-orange-500 font-bold tracking-[0.4em] text-[9px] uppercase opacity-70">{type}</span>
            <h3 className="text-3xl md:text-5xl font-bold serif leading-tight italic">
              {title}
            </h3>
          </div>
          <div className="h-px w-20 bg-gray-100"></div>
          <p className="text-sm text-gray-500 font-light leading-relaxed max-w-xs">
            {type.includes('МУДБОРД') 
              ? 'Коллаж отобранных материалов и текстур для тактильного восприятия концепции.' 
              : 'Фотореалистичная визуализация, демонстрирующая объемно-планировочное решение и атмосферу.'}
          </p>
        </div>
        
        <div className="order-1 lg:order-2 relative">
          {url ? (
            <div className="rounded-[3rem] overflow-hidden shadow-xl border border-gray-100 group aspect-video">
              <img 
                src={url} 
                alt={title} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-50 rounded-[3rem] flex flex-col items-center justify-center border border-gray-100 space-y-4">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-gray-400 italic tracking-widest text-[10px] uppercase font-bold">Rendering Concept...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-20 px-4 md:px-6 space-y-24 print:space-y-0 print:py-0">
      <style>{`
        @media print {
          @page { margin: 15mm; size: a4; }
          body { background: white !important; margin: 0; padding: 0; color: #000; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; break-before: page; padding-top: 15mm !important; }
          .print-break:first-of-type { page-break-before: auto; break-before: auto; padding-top: 0 !important; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; display: block; }
          h1, h2, h3 { page-break-after: avoid; break-after: avoid; }
          img { max-width: 100%; height: auto; page-break-inside: avoid; border-radius: 12px !important; }
          .technical-brief-content { font-size: 11pt; line-height: 1.6; color: #333 !important; }
        }
      `}</style>

      {/* TITLES */}
      <header className="text-center space-y-8 avoid-break relative">
        <button 
          onClick={() => window.location.href = '/'} 
          className="no-print absolute top-0 left-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[#2C3E50] transition-all group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
          На главную
        </button>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4 no-print"
        >
          <Sparkles className="w-3 h-3 text-orange-500" />
          AI Architectural Portfolio
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-9xl font-bold serif text-[#2C3E50] leading-none tracking-tighter"
        >
          Design <span className="italic font-light text-orange-500">Suite</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 max-w-2xl mx-auto text-lg font-light leading-relaxed uppercase tracking-[0.3em] pt-4"
        >
          Комплексная концепция Вашего будущего дома
        </motion.p>
      </header>

      {/* VISUAL SECTIONS */}
      <div className="space-y-8 print-break">
        <VisualCard 
          url={result.moodboardImageUrl} 
          title={`Материалы: ${result.moodboardDescription}`} 
          type="ОБЩИЙ МУДБОРД МАТЕРИАЛОВ" 
        />
        <VisualCard 
          url={result.interiorVisualUrl} 
          title="Визуализация интерьера" 
          type="ИНТЕРЬЕР (ЖИЛАЯ ЗОНА)" 
        />
        <VisualCard 
          url={result.bathroomVisualUrl} 
          title="Визуализация санузла" 
          type="ИНТЕРЬЕР (САНУЗЕЛ)" 
        />
        <VisualCard 
          url={result.bathroomMoodboardUrl} 
          title="Материалы санузла" 
          type="МУДБОРД МАТЕРИАЛОВ САНУЗЛА" 
        />
      </div>

      {/* REFERENCES */}
      <section className="print-break py-10">
        <div className="flex items-center gap-10 mb-16 avoid-break">
          <h2 className="text-[10px] font-black text-[#2C3E50] uppercase tracking-[0.5em] whitespace-nowrap">Your Selection</h2>
          <div className="h-px bg-gray-100 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {result.choices.map((choice, idx) => (
            <div 
              key={idx} 
              className="group avoid-break"
            >
              <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 bg-white border border-gray-100 shadow-sm transition-all group-hover:shadow-md group-hover:border-orange-500/30">
                {choice.image ? (
                  <img src={choice.image} alt={choice.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-50 opacity-30">🏛️</div>
                )}
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest text-orange-500 mb-1">{choice.stepTitle}</p>
              <p className="text-sm font-bold text-[#2C3E50] serif">{choice.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TECHNICAL BRIEF */}
      <section className="print-break bg-white rounded-[4rem] p-12 md:p-24 border border-[#E8E2D9] shadow-sm print:border-none print:p-0">
        <div className="max-w-3xl mx-auto technical-brief-content relative">
          <button 
            onClick={copyToClipboard}
            className="no-print absolute top-0 right-0 bg-gray-50 text-gray-400 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#2C3E50] hover:text-white transition-all flex items-center gap-2"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Готово' : 'Копировать ТЗ'}
          </button>
          
          <header className="mb-16 avoid-break">
            <h2 className="text-5xl md:text-8xl font-bold serif text-[#2C3E50] mb-6 tracking-tighter">Brief</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em]">Expert Project Documentation</p>
          </header>

          <div className="markdown-body">
            <Markdown
              components={{
                h1: ({ children }) => <h1 className="text-4xl md:text-6xl font-bold text-[#2C3E50] mt-16 mb-10 serif leading-tight">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl md:text-4xl font-bold text-[#2C3E50] mt-14 mb-8 border-b border-gray-100 pb-4 serif italic">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base md:text-lg font-black text-orange-500 mt-10 mb-6 uppercase tracking-[0.2em]">{children}</h3>,
                p: ({ children }) => <p className="mb-6 text-lg md:text-xl leading-relaxed text-gray-500 font-light">{children}</p>,
                ul: ({ children }) => <ul className="mb-10 space-y-4">{children}</ul>,
                li: ({ children }) => (
                  <li className="flex items-start gap-6 pl-2">
                    <span className="mt-2.5 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>
                    <span className="text-lg md:text-xl leading-relaxed font-light text-gray-600">{children}</span>
                  </li>
                ),
                strong: ({ children }) => <strong className="font-bold text-[#2C3E50]">{children}</strong>,
              }}
            >
              {result.technicalAssignment}
            </Markdown>
          </div>
        </div>
      </section>

      {/* FOOTER ACTIONS */}
      <footer className="flex flex-col md:flex-row items-center justify-center gap-8 pt-10 pb-40 no-print">
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="group w-full md:w-auto px-12 py-6 bg-orange-500/10 text-orange-500 rounded-full font-bold hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-6 shadow-xl"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Дополнения и правки</span>
        </button>
        <button
          onClick={handlePrint}
          className="group w-full md:w-auto px-12 py-6 border-2 border-gray-100 text-[#2C3E50] rounded-full font-bold hover:bg-[#2C3E50] hover:text-white transition-all flex items-center justify-center gap-6 shadow-xl"
        >
          <Printer className="w-5 h-5" />
          Экспорт в PDF
        </button>
        <button
          onClick={onRestart}
          className="w-full md:w-auto px-12 py-6 bg-[#2C3E50] text-white rounded-full font-bold hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-6"
        >
          <Plus className="w-5 h-5" />
          Новый проект
        </button>
      </footer>

      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1A1A1A] p-8 rounded-[3rem] shadow-2xl w-full max-w-lg relative border border-white/10"
            >
              <button 
                onClick={() => setIsFeedbackOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-orange-500" />
                Дополнения и правки
              </h2>
              
              <textarea 
                value={feedbackText} 
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full h-40 p-6 bg-white/5 border border-white/10 rounded-3xl text-white mb-6 focus:border-orange-500 outline-none transition-all placeholder:text-gray-600"
                placeholder="Опишите, что нужно изменить..."
              />
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsFeedbackOpen(false)} 
                  className="flex-1 py-4 rounded-2xl border border-white/10 text-gray-400 hover:bg-white/5 transition-all"
                >
                  Отмена
                </button>
                <button 
                  onClick={handleRegenerate} 
                  disabled={isRegenerating || !feedbackText.trim()}
                  className="flex-1 py-4 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRegenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isRegenerating ? 'Генерация...' : 'Генерировать'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultView;

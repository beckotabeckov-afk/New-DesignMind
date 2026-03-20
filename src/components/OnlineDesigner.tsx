
import React, { useState, useRef } from 'react';
import { editInteriorImage } from '../../gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, Download, Upload, Loader2, Image as ImageIcon, Wand2 } from 'lucide-react';

const OnlineDesigner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    try {
      const editedImage = await editInteriorImage(image, prompt);
      if (editedImage) {
        setResult(editedImage);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto py-24 px-8 space-y-20"
    >
      <header className="text-center space-y-6">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-6xl md:text-8xl font-bold serif text-[#2C3E50] tracking-tighter"
        >
          Online <span className="italic font-light text-orange-400">Designer</span>
        </motion.h2>
        <p className="text-gray-400 uppercase tracking-[0.4em] text-[10px] font-black">
          Мгновенная визуализация Ваших идей на реальных фото
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Side: Controls */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-10 bg-white p-10 md:p-16 rounded-[4rem] border border-[#E8E2D9] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          
          <div className="space-y-6 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2C3E50] text-white flex items-center justify-center text-[8px]">1</span>
              Загрузите фото комнаты
            </label>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-all overflow-hidden bg-gray-50/50 relative group"
            >
              {image ? (
                <>
                  <img src={image} alt="Original" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="w-8 h-8 text-white" />
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">Сменить фото</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Camera className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Нажмите для загрузки</p>
                </div>
              )}
            </motion.div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <div className="space-y-6 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2C3E50] text-white flex items-center justify-center text-[8px]">2</span>
              Что нужно изменить?
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Например: 'Добавь на эту стену декоративные рейки из светлого дерева и повесь современную картину в черной раме'"
              className="w-full h-40 p-8 rounded-[2.5rem] border border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-orange-400/10 focus:border-orange-400 outline-none transition-all text-sm leading-relaxed serif italic"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={!image || !prompt || loading}
            className="w-full py-8 bg-[#2C3E50] text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Магия в процессе...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Визуализировать идею</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Right Side: Result */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="sticky top-12 space-y-8">
            <div className="bg-[#0A0A0A] rounded-[4rem] aspect-square overflow-hidden shadow-2xl relative flex items-center justify-center border border-white/5">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.img 
                    key="result"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    src={result} 
                    alt="Result" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <motion.div 
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-8 p-16"
                  >
                    <div className="w-24 h-24 mx-auto border border-white/10 rounded-full flex items-center justify-center relative">
                      <Sparkles className="w-10 h-10 text-orange-400/40" />
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-t border-orange-400/20 rounded-full"
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Результат появится здесь</p>
                      <p className="text-white/20 text-xs italic serif max-w-xs mx-auto">ИИ проанализирует Ваше фото и добавит желаемые элементы дизайна</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = result;
                    link.download = 'ai-design-result.png';
                    link.click();
                  }}
                  className="flex-1 py-6 bg-white border-2 border-[#2C3E50] text-[#2C3E50] rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#2C3E50] hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <Download className="w-4 h-4" />
                  Скачать результат
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OnlineDesigner;

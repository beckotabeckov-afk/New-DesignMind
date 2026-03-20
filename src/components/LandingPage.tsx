import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import AuthModal from './AuthModal';
import AccountModal from './AccountModal';
import InspirationFeed from './InspirationFeed';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  User, 
  Layers, 
  MessageSquare, 
  Zap,
  ChevronDown
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const { user } = useAuth();

  const handleStartQuiz = () => {
    if (user) {
      navigate('/quiz/1');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden font-sans">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>
      
      <header className="relative z-30 w-full p-6 md:p-10 flex justify-between items-center max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter">Design<span className="text-orange-500">Mind</span></h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Функции</a>
            <a href="#inspiration" className="hover:text-white transition-colors">Вдохновение</a>
            <a href="#" className="hover:text-white transition-colors">Цены</a>
          </nav>

          {user ? (
            <button 
              onClick={() => setIsAccountModalOpen(true)} 
              className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-all"
            >
              {user.photoURL ? (
                <img src={user.photoURL} className="w-8 h-8 rounded-full border border-white/20" alt="Profile" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-sm hidden sm:inline">Кабинет</span>
            </button>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)} 
              className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-orange-500 hover:text-white transition-all shadow-lg active:scale-95"
            >
              Войти
            </button>
          )}
        </motion.div>
      </header>

      <main className="relative z-20 flex flex-col items-center pt-20 md:pt-32 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-bold uppercase tracking-widest">
            <Zap className="w-3 h-3 fill-current" />
            AI-Powered Design Briefing
          </div>

          <h2 className="text-5xl md:text-8xl font-bold leading-[0.9] tracking-tight serif">
            Осознайте свои <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 italic font-light">предпочтения</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Создайте профессиональный дизайн-бриф за 5 минут. Наш ИИ проанализирует ваши ответы и сформирует идеальное техническое задание.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={handleStartQuiz}
              className="w-full sm:w-auto bg-orange-500 text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl shadow-orange-500/20 hover:bg-orange-600 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
            >
              Начать бриф
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
              Смотреть примеры
            </button>
          </div>
        </motion.div>

        {/* Stats / Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left"
          id="features"
        >
          {[
            { icon: Layers, title: "Умная структура", desc: "Квиз адаптируется под ваши ответы в реальном времени." },
            { icon: MessageSquare, title: "ИИ Аналитика", desc: "Генерация ТЗ на основе глубокого анализа предпочтений." },
            { icon: Zap, title: "Мгновенный результат", desc: "Получите мудборд и визуализации сразу после прохождения." }
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-orange-500/50 transition-colors group">
              <f.icon className="w-10 h-10 text-orange-500 mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold mb-2">{f.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <div className="w-full mt-40 relative z-20" id="inspiration">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
          <div>
            <h3 className="text-3xl md:text-5xl font-bold serif">Лента вдохновения</h3>
            <p className="text-gray-500 mt-2">Посмотрите, что создают другие пользователи</p>
          </div>
          <ChevronDown className="w-8 h-8 text-gray-700 animate-bounce" />
        </div>
        <InspirationFeed />
      </div>

      <footer className="relative z-20 py-20 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="font-bold">DesignMind © 2026</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Конфиденциальность</a>
            <a href="#" className="hover:text-white transition-colors">Условия</a>
            <a href="#" className="hover:text-white transition-colors">Контакты</a>
          </div>
        </div>
      </footer>

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      {isAccountModalOpen && <AccountModal onClose={() => setIsAccountModalOpen(false)} />}
    </div>
  );
};

export default LandingPage;

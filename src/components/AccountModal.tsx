import React from 'react';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, User, Mail, Fingerprint } from 'lucide-react';

interface AccountModalProps {
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ onClose }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[3.5rem] p-12 max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
        
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="relative space-y-10">
          <header className="space-y-2">
            <h2 className="text-4xl font-bold text-[#2C3E50] serif">Профиль</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ваши данные в системе</p>
          </header>

          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#2C3E50]">
                <User className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Имя пользователя</p>
                <p className="font-bold text-[#2C3E50]">{user?.displayName || 'Пользователь'}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#2C3E50]">
                <Mail className="w-8 h-8" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Email адрес</p>
                <p className="font-bold text-[#2C3E50] truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#2C3E50]">
                <Fingerprint className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Уникальный ID</p>
                <p className="font-mono text-[10px] text-gray-500 truncate">{user?.uid}</p>
              </div>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout} 
            className="w-full bg-red-500 text-white py-6 rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-3"
          >
            <LogOut className="w-4 h-4" />
            Выйти из аккаунта
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountModal;

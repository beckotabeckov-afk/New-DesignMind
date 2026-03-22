import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    setError('');
    try {
      await loginWithGoogle();
      onClose();
      navigate('/quiz/1');
    } catch (error: any) {
      console.error("Google Auth error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Окно авторизации было закрыто. Если вы не закрывали его сами, попробуйте открыть приложение в новой вкладке (кнопка в правом верхнем углу AI Studio).');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Всплывающее окно заблокировано. Пожалуйста, разрешите всплывающие окна в настройках браузера или откройте приложение в новой вкладке.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('Этот домен не разрешен для авторизации. Пожалуйста, добавьте текущий URL в список разрешенных доменов в консоли Firebase.');
      } else {
        setError('Произошла ошибка при входе: ' + (error.message || 'Неизвестная ошибка'));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative border border-white/20">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-black text-2xl font-bold transition-colors">×</button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Вход в систему</h2>
          <p className="text-slate-500 mt-2">Используйте Google для быстрого и безопасного входа</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleAuth} 
          className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 p-5 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-100 transition-all group"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-6 h-6"
          />
          <span>Продолжить с Google</span>
        </button>

        <p className="mt-8 text-center text-xs text-slate-400 uppercase tracking-widest font-medium">
          Безопасная авторизация
        </p>
      </div>
    </div>
  );
};

export default AuthModal;

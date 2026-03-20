import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck, ArrowRight } from 'lucide-react';

const AuthPage: React.FC = () => {
  const { user, loginWithGoogle, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      // Navigation is handled by useEffect
    } catch (err: any) {
      console.error(err);
      setError('Не удалось войти через Google. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Добро пожаловать</h1>
          <p className="text-slate-500 mt-2">Войдите, чтобы сохранять свои квизы и видеть результаты</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 text-slate-700 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-5 h-5"
          />
          <span>{isLoggingIn ? 'Вход...' : 'Войти через Google'}</span>
          {!isLoggingIn && <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-indigo-600 transition-colors" />}
        </button>

        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Безопасный вход через Firebase</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;

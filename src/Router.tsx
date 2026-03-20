import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import QuizPage from './QuizPage';
import { AuthProvider } from './components/AuthProvider';
import { AuthGuard } from './components/AuthGuard';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route 
            path="/quiz/:id" 
            element={
              <AuthGuard>
                <QuizPage />
              </AuthGuard>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;

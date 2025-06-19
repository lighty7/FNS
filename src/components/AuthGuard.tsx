import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthForm from './AuthForm';
import LoadingSpinner from './ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
};

export default AuthGuard;
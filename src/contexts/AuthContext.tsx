import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { authService, CurrentUser, LoginRequest } from '../services/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LoginModal from '@/components/LoginModal';

interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isSessionExpired: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  openLoginFromSessionExpired: () => void;
  closeSessionExpiredModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session Expired Modal Component
interface SessionExpiredModalProps {
  open: boolean;
  onOpenLogin: () => void;
  onClose: () => void;
}

function SessionExpiredModal({ open, onOpenLogin, onClose }: SessionExpiredModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
          <DialogTitle className="text-xl">Sessão Expirada</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Sua sessão expirou por inatividade. Por favor, faça login novamente para continuar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={onOpenLogin}
            className="w-full bg-gradient-to-r from-golden to-golden-light text-secondary font-semibold hover:opacity-90"
          >
            Fazer Login
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Login Modal Wrapper for session expiry flow
interface LoginModalWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function LoginModalWrapper({ open, onOpenChange }: LoginModalWrapperProps) {
  return (
    <LoginModal
      open={open}
      onOpenChange={onOpenChange}
      onLoginSuccess={() => onOpenChange(false)}
    />
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [showLoginAfterExpiry, setShowLoginAfterExpiry] = useState(false);

  const loadUser = useCallback(async () => {
    const hasToken = authService.hasToken();
    console.log('[Auth] Checking token:', hasToken);

    if (!hasToken) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('[Auth] Loading user from /auth/me...');
      const currentUser = await authService.getCurrentUser();
      console.log('[Auth] User loaded:', currentUser);
      setUser(currentUser);
    } catch (error) {
      console.error('[Auth] Error loading user:', error);
      authService.logoutLocal();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for session expired events
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('[Auth] Session expired event received');
      setUser(null);
      setIsSessionExpired(true);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials: LoginRequest) => {
    await authService.login(credentials);
    setIsSessionExpired(false);
    setShowLoginAfterExpiry(false);
    await loadUser();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const openLoginFromSessionExpired = () => {
    setIsSessionExpired(false);
    setShowLoginAfterExpiry(true);
  };

  const closeSessionExpiredModal = () => {
    setIsSessionExpired(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: authService.isAdmin(user),
    isSessionExpired,
    login,
    logout,
    refreshUser,
    openLoginFromSessionExpired,
    closeSessionExpiredModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiredModal
        open={isSessionExpired}
        onOpenLogin={openLoginFromSessionExpired}
        onClose={closeSessionExpiredModal}
      />
      <LoginModalWrapper
        open={showLoginAfterExpiry}
        onOpenChange={setShowLoginAfterExpiry}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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
  mustChangePassword: boolean;
  login: (credentials: LoginRequest) => Promise<{ mustChangePassword: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  completePasswordChange: () => Promise<void>;
  syncUserAfterPasswordReset: () => void;
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
          <DialogTitle className="text-xl text-center">Sessão Expirada</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Por favor, faça login novamente para continuar.
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
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const loadUser = useCallback(async (forceRefresh = false) => {
    const hasToken = authService.hasToken();

    if (!hasToken) {
      setIsLoading(false);
      return;
    }

    // Tenta carregar do cache primeiro (sem fazer requisição)
    const cachedUser = authService.getCachedUser();

    if (cachedUser && !forceRefresh) {
      // Usa dados do cache - não faz requisição
      setUser(cachedUser);
      setIsLoading(false);
      return;
    }

    // Se não tem cache ou forceRefresh, busca do servidor
    try {
      const currentUser = await authService.fetchAndCacheUser();
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
      // Limpa dados do usuário do cache quando a sessão expira
      authService.logoutLocal();
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

  const login = async (credentials: LoginRequest): Promise<{ mustChangePassword: boolean }> => {
    const response = await authService.login(credentials);
    setIsSessionExpired(false);
    setShowLoginAfterExpiry(false);

    // Se precisa trocar senha, não carrega usuário ainda
    if (response.mustChangePassword) {
      setMustChangePassword(true);
      return { mustChangePassword: true };
    }

    // O login já busca e cacheia o usuário, então só carrega do cache
    const cachedUser = authService.getCachedUser();
    setUser(cachedUser);
    return { mustChangePassword: false };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    // Força buscar do servidor e atualizar cache
    await loadUser(true);
  };

  const completePasswordChange = async () => {
    // Após trocar a senha, busca dados do usuário e limpa o estado
    setMustChangePassword(false);
    try {
      const currentUser = await authService.fetchAndCacheUser();
      setUser(currentUser);
    } catch (error) {
      console.error('[Auth] Error loading user after password change:', error);
    }
  };

  // Sincroniza o estado do React com o usuário já cacheado após reset de senha
  const syncUserAfterPasswordReset = () => {
    const cachedUser = authService.getCachedUser();
    if (cachedUser) {
      setUser(cachedUser);
    }
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
    mustChangePassword,
    login,
    logout,
    refreshUser,
    completePasswordChange,
    syncUserAfterPasswordReset,
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

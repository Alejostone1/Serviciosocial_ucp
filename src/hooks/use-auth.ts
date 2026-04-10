'use client';

import { useState, useEffect } from 'react';
import { Usuario, Rol } from '@prisma/client';

interface AuthState {
  user: Usuario | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Obtener usuario real de la sesión
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          setAuthState({
            user: null,
            loading: false,
            isAuthenticated: false,
          });
          return;
        }

        const data = await response.json();
        
        setAuthState({
          user: data.user,
          loading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Error loading user:', error);
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    // Implementación de login
    return { success: true };
  };

  const logout = () => {
    setAuthState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
  };

  return {
    user: authState.user,
    loading: authState.loading,
    login,
    logout,
    isAuthenticated: authState.isAuthenticated,
  };
}

export function useRole(requiredRole?: Rol) {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: Rol): boolean => {
    return user?.rol === role;
  };

  const hasAnyRole = (roles: Rol[]): boolean => {
    return user ? roles.includes(user.rol) : false;
  };

  const canAccess = (allowedRoles: Rol[]): boolean => {
    return isAuthenticated && user ? allowedRoles.includes(user.rol) : false;
  };

  return {
    hasRole,
    hasAnyRole,
    canAccess,
    isAuthorized: !requiredRole || hasRole(requiredRole),
    currentRole: user?.rol,
  };
}
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
    // Simular carga del usuario - en producción esto vendría de una API
    const loadUser = async () => {
      try {
        // Por ahora, vamos a simular que hay un usuario estudiante
        // En producción, esto debería ser una llamada real a /api/auth/me
        const mockUser: Usuario = {
          id: '59d08d6d-b13b-4418-b244-ece166d8dfff',
          primer_nombre: 'Juan',
          segundo_nombre: null,
          primer_apellido: 'Pérez',
          segundo_apellido: null,
          correo: 'estudiante.ejemplo@ucp.edu.co',
          correo_personal: null,
          contrasena_hash: null,
          telefono: null,
          foto_url: null,
          rol: Rol.ESTUDIANTE,
          id_programa: null,
          esta_bloqueado: false,
          motivo_bloqueo: null,
          ultimo_acceso: null,
          requiere_cambio_clave: false,
          numero_documento: '12345678',
          tipo_documento: 'CC',
          creado_en: new Date(),
          actualizado_en: new Date(),
        };

        setAuthState({
          user: mockUser,
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
'use client';

import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { signOut } from 'next-auth/react';

export function ProfesorHeader() {
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6">
      <div className="flex h-full items-center justify-between">
        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Profesor</p>
              <p className="text-xs text-gray-500">profesor@ucp.edu.co</p>
            </div>
            <div className="relative">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <User className="h-4 w-4" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 hidden">
                <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </button>
                <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

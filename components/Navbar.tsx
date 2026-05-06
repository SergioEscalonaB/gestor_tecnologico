"use client";

import React from "react";

// Importamos los componentes de lucide-react
import { 
  Bell, 
  Search, 
  User, 
  Menu
} from "lucide-react";

// Interfaz para las propiedades de la barra de navegación
interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {/* Botón de alternancia para escritorio */}
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg hidden lg:block transition-colors"
          title="Alternar Sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Busqueda */}
        <div className="relative group hidden sm:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
            placeholder="Buscar activos..."
          />
        </div>
      </div>

      {/* Lado Derecho */}
      <div className="flex items-center gap-4">
        {/* Boton de notificaciones */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Separador vertical */}
        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        {/* Usuario */}
        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-xl transition-colors">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-none">Sergio Luis</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center text-white border border-blue-200 shadow-sm">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

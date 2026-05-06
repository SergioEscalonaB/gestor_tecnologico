"use client";

// Importamos los componentes de sidebar y navbar
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

// Interfaz para las propiedades del layout wrapper
export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  // Estado para controlar si el sidebar está colapsado
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Función para alternar el sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* Area de contenido principal */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Navbar */}
        <Navbar onToggleSidebar={toggleSidebar} />
        
        {/* Area de contenido principal */}
        <main className="p-6 lg:p-10 flex-1 animate-fade-in">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-6 px-8 bg-white border-t border-gray-200 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} GestorTech — Control de Activos Tecnológicos</p>
        </footer>
      </div>
    </div>
  );
};

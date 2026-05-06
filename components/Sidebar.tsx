"use client";
// Componente Sidebar
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Laptop, 
  Tags,
  Menu,
  Wrench,
  X
} from "lucide-react";

// Interface para las propiedades del item de la barra lateral
interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isCollapsed: boolean;
}

// Componente para los items de la barra lateral
const SidebarItem = ({ href, icon, label, active, isCollapsed }: SidebarItemProps) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group ${
      active 
        ? "bg-blue-600 text-white shadow-md" 
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    } ${isCollapsed ? "justify-center px-2" : ""}`}
  >
    <div className="shrink-0">{icon}</div>
    
    {/* Lógica de etiquetas */}
    {!isCollapsed ? (
      <span className="font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
        {label}
      </span>
    ) : (
      /* Etiqueta desplegable al pasar el cursor cuando está contraído */
      <span className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-xl border border-gray-700">
        {label}
        {/* Flecha del triángulo para el flyout */}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700"></div>
      </span>
    )}  
  </Link>
);

// Interface para las propiedades del sidebar
interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

// Componente Sidebar
export const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const menuItems = [
    { href: "/", icon: <LayoutDashboard size={22} />, label: "Dashboard", section: "principal" },
    { href: "/activos", icon: <Laptop size={22} />, label: "Activos", section: "principal" },
    { href: "/categorias", icon: <Tags size={22} />, label: "Categorías", section: "principal" },
    { href: "/mantenimientos", icon: <Wrench size={22} />, label: "Mantenimientos", section: "mantenimiento" }
    
  ];

  return (
    <>
      {/* Contenedor del sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-[#1a202c] shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex flex-col h-full relative">
          
          {/* Logo / Brand */}
          <div className={`p-6 border-b border-gray-700 flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3"}`}>
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg shrink-0">
                <Laptop className="text-white" size={24} />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-white tracking-tight">
                  Gestor<span className="text-blue-400">Tech</span>
                </span>
              )}
            </Link>
          </div>

          {/* Barra de navegación Menu principal */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {!isCollapsed && (
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4 px-4">
                Menú Principal
              </div>
            )}
            
            {menuItems.filter(item => item.section === "principal").map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
                active={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}

            {/* Barra de navegación Mantenimientos */}
            {!isCollapsed && (
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4 px-4">
                Mantenimientos
              </div>
            )}
            
            {menuItems.filter(item => item.section === "mantenimiento").map((item) => (
              <SidebarItem 
                key={item.href}
                {...item}
                active={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}

            {/* Añadir otras secciones*/}
            <div className="pt-4">
              <div className="border-t border-gray-700 my-4 opacity-50"></div>
              {!isCollapsed && (
                <p className="text-[10px] text-gray-500 italic px-4 text-center">Espacio para más...</p>
              )}
            </div>
          </nav>

          {/* Perfil de usuario */}
          <div className={`p-4 border-t border-gray-700 bg-gray-900/50 flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3"}`}>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
              SL
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate">Sergio Luis</span>
                <span className="text-[9px] text-gray-400 uppercase tracking-tighter">Admin</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay móvil */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

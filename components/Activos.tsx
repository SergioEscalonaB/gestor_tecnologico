"use client";

import React from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2,
  MoreHorizontal
} from "lucide-react";

// Definición de tipos para los activos
interface Activo {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  marca: string;
  estado: "Activo" | "En Mantenimiento" | "Dado de Baja";
  ubicacion: string;
}

// Datos de ejemplo basados en la imagen
const activos: Activo[] = [
  { id: "1", codigo: "AGT-2024-001", nombre: "Laptop Dell Inspiron 15", categoria: "Computadores", marca: "Dell", estado: "Activo", ubicacion: "Oficina Principal" },
  { id: "2", codigo: "AGT-2024-002", nombre: "Impresora HP LaserJet Pro", categoria: "Impresoras", marca: "HP", estado: "Activo", ubicacion: "Oficina Principal" },
  { id: "3", codigo: "AGT-2024-003", nombre: "Switch Cisco SG250", categoria: "Dispositivos de Red", marca: "Cisco", estado: "Activo", ubicacion: "Sala de Redes" },
  { id: "4", codigo: "AGT-2024-004", nombre: "iPhone 15 Pro", categoria: "Celulares", marca: "Apple", estado: "Activo", ubicacion: "Gerencia" },
  { id: "5", codigo: "AGT-2024-005", nombre: "Monitor LG 24\"", categoria: "Monitores", marca: "LG", estado: "Activo", ubicacion: "Oficina Principal" },
  { id: "6", codigo: "AGT-2024-006", nombre: "Access Point Ubiquiti", categoria: "Dispositivos de Red", marca: "Ubiquiti", estado: "En Mantenimiento", ubicacion: "Sala de Redes" },
  { id: "7", codigo: "AGT-2024-007", nombre: "Desktop HP EliteDesk", categoria: "Computadores", marca: "HP", estado: "Dado de Baja", ubicacion: "Contabilidad" },
  { id: "8", codigo: "AGT-2024-008", nombre: "Tablet Samsung Galaxy S9", categoria: "Tabletas", marca: "Samsung", estado: "Activo", ubicacion: "Ventas" },
];

export default function Activos() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Activos</h1>
        <div className="flex items-center text-sm text-gray-500">
          <span>Inventario</span>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-blue-600 font-medium">Activos</span>
        </div>
      </div>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Barra de busqueda y filtrado */}
        <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white border-b border-gray-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar activos..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-medium">
              <Filter size={18} />
              <span>Filtros</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-semibold">
              <Plus size={20} />
              <span>Nuevo Activo</span>
            </button>
          </div>
        </div>

        {/* Tabla de activos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marca</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ubicación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activos.map((activo) => (
                <tr key={activo.id} className="hover:bg-blue-50/30 transition-colors group">
                  {/* codigo del activo */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-700 tracking-tight">{activo.codigo}</span>
                  </td>
                  {/* nombre del activo */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{activo.nombre}</span>
                  </td>
                  {/* categoria del activo */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      {activo.categoria}
                    </span>
                  </td>
                  {/* marca del activo */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {activo.marca}
                  </td>
                  {/* estado del activo */}
                <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      activo.estado === 'Activo' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : activo.estado === 'En Mantenimiento'
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {activo.estado}
                      {activo.estado === 'Dado de Baja' && <Trash2 size={12} className="text-red-500" />}
                    </span>
                  </td>
                  {/* ubicacion del activo */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-gray-600">{activo.ubicacion}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sección de paginación */}
        <div className="p-6 bg-white border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-900">1</span> a <span className="font-semibold text-gray-900">8</span> de <span className="font-semibold text-gray-900">245</span> registros
          </p>
          {/* Botones de paginación */}
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            {/* Numeros de página */}
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white font-semibold text-sm shadow-sm">1</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-600 font-medium text-sm transition-colors border border-transparent hover:border-gray-200">2</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-600 font-medium text-sm transition-colors border border-transparent hover:border-gray-200">3</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-600 font-medium text-sm transition-colors border border-transparent hover:border-gray-200">4</button>
              <span className="px-2 text-gray-400 text-sm">...</span>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-600 font-medium text-sm transition-colors border border-transparent hover:border-gray-200">35</button>
            </div>
            {/* Botón de siguiente página */} 
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

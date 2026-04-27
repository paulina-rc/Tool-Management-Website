import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, BarChart2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAppStore } from '../store/AppStore';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  Disponible: '#2e7d32',
  Reservada: '#1d5e8c',
  Prestada: '#b07d2a',
  'En reparación': '#b32020',
  Baja: '#78716c',
};

export function ToolsList() {
  const { tools } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                         tool.code.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || tool.type === filterType;
    const matchesStatus = filterStatus === 'all' || tool.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toolTypes = Array.from(new Set(tools.map(t => t.type)));

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Disponible':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Reservada':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Prestada':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'En reparación':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'Baja':
        return 'bg-stone-100 text-stone-600 border border-stone-200';
      default:
        return 'bg-stone-100 text-stone-600 border border-stone-200';
    }
  };

  const inventorySummary = [
    { label: 'Disponibles', count: tools.filter(t => t.status === 'Disponible').length, color: 'text-emerald-700' },
    { label: 'Reservadas', count: tools.filter(t => t.status === 'Reservada').length, color: 'text-blue-700' },
    { label: 'Prestadas', count: tools.filter(t => t.status === 'Prestada').length, color: 'text-amber-700' },
    { label: 'En reparación', count: tools.filter(t => t.status === 'En reparación').length, color: 'text-red-700' },
    { label: 'Baja', count: tools.filter(t => t.status === 'Baja').length, color: 'text-stone-500' },
  ];

  const pieData = inventorySummary.filter(i => i.count > 0).map((i, index) => ({
    name: i.label,
    value: i.count,
    _key: `pie-status-${index}`,
  }));

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div className="pb-5 border-b border-stone-200">
        <h1 className="text-[#1a1819]">Inventario de Herramientas</h1>
        <p className="text-stone-500 text-sm mt-1">Consulta y gestión del inventario disponible</p>
      </div>

      {/* Tool Category Image Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative rounded-md overflow-hidden h-40 group cursor-pointer"
          onClick={() => setFilterType('Herramienta de mano')}>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758761864993-d02a64d7ba54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtJTIwYmFybiUyMHJ1cmFsJTIwY291bnRyeXNpZGUlMjB0b29scyUyMHN0b3JhZ2V8ZW58MXx8fHwxNzc0NjQ1MzgyfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Herramientas de mano agrícolas"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#1a2535]/60 flex flex-col justify-end p-4 transition-colors group-hover:bg-[#1a2535]/70">
            <p className="text-white text-xs uppercase tracking-widest font-medium">Herramientas de Mano</p>
            <p className="text-stone-300 text-xs mt-0.5">
              {tools.filter(t => t.type === 'Herramienta de mano').length} unidades en inventario
            </p>
          </div>
          <div className="absolute top-3 right-3 bg-white/10 border border-white/20 rounded-sm px-2 py-0.5">
            <span className="text-white text-xs font-medium">
              {tools.filter(t => t.type === 'Herramienta de mano' && t.status === 'Disponible').length} disp.
            </span>
          </div>
        </div>

        <div className="relative rounded-md overflow-hidden h-40 group cursor-pointer"
          onClick={() => setFilterType('Herramienta eléctrica')}>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1708975477074-71e2907b699f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFjdG9yJTIwZmFybSUyMG1hY2hpbmVyeSUyMGZpZWxkJTIwYWdyaWN1bHR1cmV8ZW58MXx8fHwxNzc0NjQ1MzgxfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Maquinaria agrícola eléctrica"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#1a2535]/60 flex flex-col justify-end p-4 transition-colors group-hover:bg-[#1a2535]/70">
            <p className="text-white text-xs uppercase tracking-widest font-medium">Herramientas Eléctricas</p>
            <p className="text-stone-300 text-xs mt-0.5">
              {tools.filter(t => t.type === 'Herramienta eléctrica').length} unidades en inventario
            </p>
          </div>
          <div className="absolute top-3 right-3 bg-white/10 border border-white/20 rounded-sm px-2 py-0.5">
            <span className="text-white text-xs font-medium">
              {tools.filter(t => t.type === 'Herramienta eléctrica' && t.status === 'Disponible').length} disp.
            </span>
          </div>
        </div>

        <div className="relative rounded-md overflow-hidden h-40 group cursor-pointer"
          onClick={() => setFilterType('Instrumento de medición')}>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1738598665806-7ecc32c3594c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2lsJTIwbWVhc3VyZW1lbnQlMjBwcmVjaXNpb24lMjBhZ3JpY3VsdHVyZSUyMHNjaWVuY2V8ZW58MXx8fHwxNzc0NjQ1MzgzfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Instrumentos de medición de suelo"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#1a2535]/60 flex flex-col justify-end p-4 transition-colors group-hover:bg-[#1a2535]/70">
            <p className="text-white text-xs uppercase tracking-widest font-medium">Instrumentos de Medición</p>
            <p className="text-stone-300 text-xs mt-0.5">
              {tools.filter(t => t.type === 'Instrumento de medición').length} unidades en inventario
            </p>
          </div>
          <div className="absolute top-3 right-3 bg-white/10 border border-white/20 rounded-sm px-2 py-0.5">
            <span className="text-white text-xs font-medium">
              {tools.filter(t => t.type === 'Instrumento de medición' && t.status === 'Disponible').length} disp.
            </span>
          </div>
        </div>
      </div>

      {/* Summary strip + chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {inventorySummary.map((item) => (
            <div key={item.label} className="bg-white border border-stone-200 rounded-sm p-3 text-center">
              <p className={`text-2xl font-light ${item.color}`}>{item.count}</p>
              <p className="text-xs text-stone-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Mini PieChart */}
        <Card className="border-stone-200 shadow-none">
          <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-stone-700 flex items-center gap-2">
              <BarChart2 className="size-3.5 text-stone-400" />
              Distribución de Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {tools.length === 0 ? (
              <div className="text-center py-6 text-stone-400 text-xs">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={45}
                    dataKey="value"
                    label={({ percent }) => percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`tools-pie-cell-${idx}`} fill={STATUS_COLORS[entry.name] || '#999'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, border: '1px solid #e5e3de', borderRadius: 4 }} />
                  <Legend
                    wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
                    iconSize={8}
                    iconType="square"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
            <Search className="size-4 text-stone-400" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-stone-200 bg-[#f8f7f4] text-sm h-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="border-stone-200 bg-[#f8f7f4] text-sm h-9 text-stone-700">
                <SelectValue placeholder="Tipo de herramienta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {toolTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="border-stone-200 bg-[#f8f7f4] text-sm h-9 text-stone-700">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Disponible">Disponible</SelectItem>
                <SelectItem value="Reservada">Reservada</SelectItem>
                <SelectItem value="Prestada">Prestada</SelectItem>
                <SelectItem value="En reparación">En reparación</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-medium text-stone-700">
            Herramientas <span className="text-stone-400 font-normal">({filteredTools.length} resultados)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left py-3 px-5 text-xs font-medium text-stone-500 uppercase tracking-wide">Código</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-stone-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-stone-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-stone-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left py-3 px-5 text-xs font-medium text-stone-500 uppercase tracking-wide">Ubicación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-5 font-mono text-xs text-stone-500">{tool.code}</td>
                    <td className="py-3 px-5 text-sm text-stone-800 font-medium">{tool.name}</td>
                    <td className="py-3 px-5 text-xs text-stone-500">{tool.type}</td>
                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 text-xs rounded-sm font-medium ${getStatusStyle(tool.status)}`}>
                        {tool.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-xs text-stone-500">{tool.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTools.length === 0 && (
              <div className="text-center py-12 text-stone-400 text-sm">
                No se encontraron herramientas con los filtros seleccionados
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
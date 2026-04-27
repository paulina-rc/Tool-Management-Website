import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Download, Calendar, TrendingUp, AlertTriangle, User, Wrench, LayoutDashboard, Package } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAppStore } from '../store/AppStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis,
} from 'recharts';

const TOOL_TYPES = [
  { name: 'Herramienta de mano', short: 'Mano' },
  { name: 'Herramienta eléctrica', short: 'Eléctrica' },
  { name: 'Instrumento de medición', short: 'Medición' },
];

const STATUS_COLORS: Record<string, string> = {
  Disponible: '#2e7d32',
  Reservada: '#1d5e8c',
  Prestada: '#b07d2a',
  'En reparación': '#b32020',
  Baja: '#78716c',
};

const INCIDENT_COLORS = ['#b32020', '#b07d2a', '#1d5e8c'];
const LOAN_STATUS_COLORS: Record<string, string> = {
  'En curso': '#1d5e8c',
  Liquidado: '#2e7d32',
};

function EmptyChart({ message = 'Sin datos aún' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-2 py-8">
      <TrendingUp className="size-8 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function Reports() {
  const { loans, incidents, tools, reservations } = useAppStore();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState('all');

  // ─── Disponibilidad por tipo ─────────────────────────────────────────────
  const toolsByType = TOOL_TYPES.map((tt, index) => ({
    name: tt.short,
    fullName: tt.name,
    disponibles: tools.filter(t => t.type === tt.name && t.status === 'Disponible').length,
    reservadas: tools.filter(t => t.type === tt.name && t.status === 'Reservada').length,
    prestadas: tools.filter(t => t.type === tt.name && t.status === 'Prestada').length,
    reparacion: tools.filter(t => t.type === tt.name && t.status === 'En reparación').length,
    baja: tools.filter(t => t.type === tt.name && t.status === 'Baja').length,
    total: tools.filter(t => t.type === tt.name).length,
    id: `tbt-${index}-${tt.short}`,
  }));

  // ─── Distribución de estados (PieChart global) ───────────────────────────
  const statusDistribution = Object.entries(STATUS_COLORS).map(([status, color], index) => ({
    name: status,
    value: tools.filter(t => t.status === status).length,
    color,
    id: `sd-${index}-${status}`,
  })).filter(s => s.value > 0);

  // ─── Herramientas disponibles ────────────────────────────────────────────
  const availableTools = tools.filter(t => t.status === 'Disponible');
  const totalAvailable = availableTools.length;
  const totalTools = tools.length;

  // ─── Uso de herramientas (préstamos) ─────────────────────────────────────
  const toolUsageMap: Record<string, number> = {};
  loans.forEach(loan => {
    loan.tools.forEach(t => {
      const name = t.toolName;
      toolUsageMap[name] = (toolUsageMap[name] || 0) + 1;
    });
  });
  const toolUsageData = Object.entries(toolUsageMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item, i) => ({ 
      ...item, 
      name: item.name.length > 20 ? item.name.slice(0, 18) + '…' : item.name, 
      id: `tu-${i}-${item.name.slice(0, 5)}` 
    }));

  // ─── Incidencias ─────────────────────────────────────────────────────────
  const incidentsByType = [
    { name: 'Daño', value: incidents.filter(i => i.type === 'Daño').length, id: 'inc-dano' },
    { name: 'Pérdida', value: incidents.filter(i => i.type === 'Pérdida').length, id: 'inc-perdida' },
    { name: 'Observación', value: incidents.filter(i => i.type === 'Observación').length, id: 'inc-obs' },
  ];

  // ─── Préstamos por estado ─────────────────────────────────────────────────
  const loansByStatus = [
    { name: 'En curso', value: loans.filter(l => l.status === 'En curso').length, id: 'ls-curso' },
    { name: 'Liquidado', value: loans.filter(l => l.status === 'Liquidado').length, id: 'ls-liq' },
  ];

  // ─── Reservas por estado ──────────────────────────────────────────────────
  const reservationsByStatus = [
    { name: 'Confirmada', value: reservations.filter(r => r.status === 'Confirmada').length, fill: '#2e7d32', id: 'res-conf' },
    { name: 'Pendiente', value: reservations.filter(r => r.status === 'Pendiente').length, fill: '#b07d2a', id: 'res-pend' },
    { name: 'Cancelada', value: reservations.filter(r => r.status === 'Cancelada').length, fill: '#b32020', id: 'res-canc' },
  ];

  // ─── Préstamos por profesor ───────────────────────────────────────────────
  const professors = Array.from(new Set(loans.map(l => l.professor)));
  const loansByProfessor = professors.map((prof, index) => ({
    name: prof.split(' ')[0],
    fullName: prof,
    total: loans.filter(l => l.professor === prof).length,
    enCurso: loans.filter(l => l.professor === prof && l.status === 'En curso').length,
    liquidados: loans.filter(l => l.professor === prof && l.status === 'Liquidado').length,
    id: `prof-${index}-${prof.split(' ')[0]}`,
  })).slice(0, 8);

  // ─── Radar chart para resumen de inventario ───────────────────────────────
  const radarData = TOOL_TYPES.map((tt, index) => ({
    subject: tt.short,
    Disponibles: tools.filter(t => t.type === tt.name && t.status === 'Disponible').length,
    Prestadas: tools.filter(t => t.type === tt.name && t.status === 'Prestada').length,
    'En reparación': tools.filter(t => t.type === tt.name && t.status === 'En reparación').length,
    id: `radar-${index}-${tt.short}`,
  }));

  const handleExport = (format: string) => {
    toast.success(`Exportando reporte en formato ${format.toUpperCase()}`, {
      description: 'El archivo se descargará en unos momentos',
    });
  };

  const ExportButtons = () => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}
        className="text-xs border-stone-200 text-stone-600 hover:bg-stone-50 h-8">
        <Download className="size-3.5 mr-1.5" />PDF
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport('excel')}
        className="text-xs border-stone-200 text-stone-600 hover:bg-stone-50 h-8">
        <Download className="size-3.5 mr-1.5" />Excel
      </Button>
    </div>
  );

  return (
    <div className="space-y-7">
      {/* Hero Banner */}
      <div className="relative rounded-md overflow-hidden h-44">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1627842822558-c1f15aef9838?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGhhcnZlc3QlMjBncmFpbiUyMGZpZWxkJTIwZ29sZGVufGVufDF8fHx8MTc3NDY0NTM4Mnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Campo de cosecha — Reportes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1a2535]/70 flex flex-col justify-end p-6 md:p-8">
          <h1 className="text-white">Reportes y Análisis</h1>
          <p className="text-stone-300 text-sm mt-1">Consulta de información estadística y generación de reportes</p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
            <Calendar className="size-4 text-stone-400" />
            Filtros de Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dateFrom" className="text-xs text-stone-500 uppercase tracking-wide">Fecha Desde</Label>
              <Input id="dateFrom" type="date" value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-stone-200 bg-[#f8f7f4] text-sm h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateTo" className="text-xs text-stone-500 uppercase tracking-wide">Fecha Hasta</Label>
              <Input id="dateTo" type="date" value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-stone-200 bg-[#f8f7f4] text-sm h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="professor" className="text-xs text-stone-500 uppercase tracking-wide">Profesor</Label>
              <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
                <SelectTrigger id="professor" className="border-stone-200 bg-[#f8f7f4] text-sm h-9 text-stone-700">
                  <SelectValue placeholder="Todos los profesores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los profesores</SelectItem>
                  {professors.map(professor => (
                    <SelectItem key={professor} value={professor}>{professor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="resumen" className="space-y-5">
        <TabsList className="bg-white border border-stone-200 p-1 h-auto gap-0.5 flex-wrap">
          <TabsTrigger value="resumen" className="text-xs data-[state=active]:bg-[#1a2535] data-[state=active]:text-white rounded-sm px-4 py-1.5">
            <LayoutDashboard className="size-3 mr-1.5" />Resumen General
          </TabsTrigger>
          <TabsTrigger value="availability" className="text-xs data-[state=active]:bg-[#1a2535] data-[state=active]:text-white rounded-sm px-4 py-1.5">
            <Package className="size-3 mr-1.5" />Disponibilidad
          </TabsTrigger>
          <TabsTrigger value="usage" className="text-xs data-[state=active]:bg-[#1a2535] data-[state=active]:text-white rounded-sm px-4 py-1.5">
            <TrendingUp className="size-3 mr-1.5" />Uso de Herramientas
          </TabsTrigger>
          <TabsTrigger value="incidents" className="text-xs data-[state=active]:bg-[#1a2535] data-[state=active]:text-white rounded-sm px-4 py-1.5">
            <AlertTriangle className="size-3 mr-1.5" />Incidencias
          </TabsTrigger>
          <TabsTrigger value="loans" className="text-xs data-[state=active]:bg-[#1a2535] data-[state=active]:text-white rounded-sm px-4 py-1.5">
            <User className="size-3 mr-1.5" />Préstamos
          </TabsTrigger>
        </TabsList>

        {/* ══════════ RESUMEN GENERAL ══════════ */}
        <TabsContent value="resumen" className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Total herramientas', value: totalTools, color: 'text-stone-800' },
              { label: 'Disponibles', value: totalAvailable, color: 'text-emerald-700' },
              { label: 'Reservadas', value: tools.filter(t => t.status === 'Reservada').length, color: 'text-[#1d5e8c]' },
              { label: 'Prestadas', value: tools.filter(t => t.status === 'Prestada').length, color: 'text-amber-700' },
              { label: 'En reparación / Baja', value: tools.filter(t => t.status === 'En reparación' || t.status === 'Baja').length, color: 'text-red-700' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white border border-stone-200 rounded-sm p-4 text-center">
                <p className={`text-3xl font-light ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-stone-500 mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Distribución de estados */}
            <Card className="border-stone-200 shadow-none">
              <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
                  <Wrench className="size-4 text-stone-400" />
                  Estado del Inventario
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {totalTools === 0 ? (
                  <EmptyChart message="Agregue herramientas al inventario" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`rpt-status-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e3de', borderRadius: 4 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {statusDistribution.map(s => (
                        <div key={s.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="text-xs text-stone-600">{s.name}: <strong>{s.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Reservas y préstamos por estado */}
            <Card className="border-stone-200 shadow-none">
              <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
                  <Calendar className="size-4 text-stone-400" />
                  Reservas y Préstamos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {reservations.length === 0 && loans.length === 0 ? (
                  <EmptyChart message="Cree reservas y préstamos para ver estadísticas" />
                ) : (
                  <>
                    {/* Reservas */}
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">Reservas ({reservations.length})</p>
                      <div className="space-y-1.5">
                        {reservationsByStatus.map(r => (
                          <div key={r.name} className="flex items-center gap-2">
                            <div className="flex-1 bg-stone-100 rounded-sm h-5 overflow-hidden">
                              <div
                                className="h-full rounded-sm transition-all"
                                style={{
                                  width: reservations.length > 0 ? `${(r.value / reservations.length) * 100}%` : '0%',
                                  backgroundColor: r.fill,
                                }}
                              />
                            </div>
                            <span className="text-xs text-stone-600 w-20 shrink-0">{r.name}: <strong>{r.value}</strong></span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Préstamos */}
                    <div>
                      <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">Préstamos ({loans.length})</p>
                      <div className="space-y-1.5">
                        {loansByStatus.map(l => (
                          <div key={l.name} className="flex items-center gap-2">
                            <div className="flex-1 bg-stone-100 rounded-sm h-5 overflow-hidden">
                              <div
                                className="h-full rounded-sm transition-all"
                                style={{
                                  width: loans.length > 0 ? `${(l.value / loans.length) * 100}%` : '0%',
                                  backgroundColor: LOAN_STATUS_COLORS[l.name] || '#999',
                                }}
                              />
                            </div>
                            <span className="text-xs text-stone-600 w-20 shrink-0">{l.name}: <strong>{l.value}</strong></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Radar chart por tipo */}
          {totalTools > 0 && (
            <Card className="border-stone-200 shadow-none">
              <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
                  <TrendingUp className="size-4 text-stone-400" />
                  Distribución por Tipo de Herramienta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e3de" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6e6b64' }} />
                    <Radar name="Disponibles" dataKey="Disponibles" stroke="#2e7d32" fill="#2e7d32" fillOpacity={0.25} />
                    <Radar name="Prestadas" dataKey="Prestadas" stroke="#b07d2a" fill="#b07d2a" fillOpacity={0.25} />
                    <Radar name="En reparación" dataKey="En reparación" stroke="#b32020" fill="#b32020" fillOpacity={0.15} />
                    <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e3de', borderRadius: 4 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ══════════ DISPONIBILIDAD ══════════ */}
        <TabsContent value="availability" className="space-y-5">
          {/* KPIs de disponibilidad */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-4 text-center">
              <p className="text-3xl font-light text-emerald-700">{totalAvailable}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Disponibles ahora</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 text-center">
              <p className="text-3xl font-light text-[#1d5e8c]">{tools.filter(t => t.status === 'Reservada').length}</p>
              <p className="text-xs text-blue-600 mt-0.5">Reservadas</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 text-center">
              <p className="text-3xl font-light text-amber-700">{tools.filter(t => t.status === 'Prestada').length}</p>
              <p className="text-xs text-amber-600 mt-0.5">Prestadas</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-sm p-4 text-center">
              <p className="text-3xl font-light text-red-700">{tools.filter(t => t.status === 'En reparación' || t.status === 'Baja').length}</p>
              <p className="text-xs text-red-600 mt-0.5">No disponibles</p>
            </div>
          </div>

          <Card className="border-stone-200 shadow-none">
            <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
                <TrendingUp className="size-4 text-stone-400" />
                Disponibilidad por Tipo de Herramienta
              </CardTitle>
              <ExportButtons />
            </CardHeader>
            <CardContent className="p-5">
              {totalTools === 0 ? (
                <EmptyChart message="No hay herramientas en el inventario" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={toolsByType} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e3de" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6e6b64' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#6e6b64' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e3de', borderRadius: 4 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="disponibles" fill="#2e7d32" name="Disponibles" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="reservadas" fill="#1d5e8c" name="Reservadas" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="prestadas" fill="#b07d2a" name="Prestadas" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="reparacion" fill="#b32020" name="En reparación" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-5 border border-stone-200 rounded-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                          <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Tipo</th>
                          <th className="text-center py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Disponibles</th>
                          <th className="text-center py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Reservadas</th>
                          <th className="text-center py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Prestadas</th>
                          <th className="text-center py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Reparación</th>
                          <th className="text-center py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {toolsByType.map(row => (
                          <tr key={row.fullName}>
                            <td className="py-2.5 px-4 text-sm text-stone-700">{row.fullName}</td>
                            <td className="text-center py-2.5 px-4 text-sm text-emerald-700 font-medium">{row.disponibles}</td>
                            <td className="text-center py-2.5 px-4 text-sm text-[#1d5e8c] font-medium">{row.reservadas}</td>
                            <td className="text-center py-2.5 px-4 text-sm text-amber-700 font-medium">{row.prestadas}</td>
                            <td className="text-center py-2.5 px-4 text-sm text-red-700 font-medium">{row.reparacion}</td>
                            <td className="text-center py-2.5 px-4 text-sm text-stone-800 font-medium">{row.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Lista de herramientas disponibles */}
          <Card className="border-stone-200 shadow-none">
            <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
              <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
                <Package className="size-4 text-stone-400" />
                Herramientas Disponibles Ahora
                <span className="ml-auto px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm font-normal">
                  {totalAvailable} disponibles
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {availableTools.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-sm">
                  {totalTools === 0
                    ? 'No hay herramientas registradas en el inventario'
                    : 'No hay herramientas disponibles en este momento — todas están reservadas o prestadas'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200">
                        <th className="text-left py-2.5 px-5 text-xs font-medium text-stone-500 uppercase tracking-wide">Código</th>
                        <th className="text-left py-2.5 px-5 text-xs font-medium text-stone-500 uppercase tracking-wide">Nombre</th>
                        <th className="text-left py-2.5 px-5 text-xs font-medium text-stone-500 uppercase tracking-wide">Tipo</th>
                        <th className="text-left py-2.5 px-5 text-xs font-medium text-stone-500 uppercase tracking-wide">Ubicación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {availableTools.map(tool => (
                        <tr key={tool.id} className="hover:bg-stone-50">
                          <td className="py-2.5 px-5 font-mono text-xs text-stone-500">{tool.code}</td>
                          <td className="py-2.5 px-5 text-sm text-stone-800 font-medium">{tool.name}</td>
                          <td className="py-2.5 px-5 text-xs text-stone-500">{tool.type}</td>
                          <td className="py-2.5 px-5 text-xs text-stone-500">{tool.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════ USO DE HERRAMIENTAS ══════════ */}
        <TabsContent value="usage" className="space-y-5">
          {/* KPIs de uso */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 text-center">
              <p className="text-3xl font-light text-[#1d5e8c]">{loans.length}</p>
              <p className="text-xs text-stone-500 mt-0.5">Total préstamos</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 text-center">
              <p className="text-3xl font-light text-amber-700">{loans.filter(l => l.status === 'En curso').length}</p>
              <p className="text-xs text-stone-500 mt-0.5">En curso</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 text-center">
              <p className="text-3xl font-light text-emerald-700">{loans.filter(l => l.status === 'Liquidado').length}</p>
              <p className="text-xs text-stone-500 mt-0.5">Liquidados</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 text-center">
              <p className="text-3xl font-light text-stone-700">{loans.reduce((acc, l) => acc + l.tools.length, 0)}</p>
              <p className="text-xs text-stone-500 mt-0.5">Total herramientas prestadas</p>
            </div>
          </div>

          <Card className="border-stone-200 shadow-none">
            <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
                <TrendingUp className="size-4 text-stone-400" />
                Herramientas Más Prestadas
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}
                  className="text-xs border-stone-200 text-stone-600 hover:bg-stone-50 h-8">
                  <Download className="size-3.5 mr-1.5" />PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('csv')}
                  className="text-xs border-stone-200 text-stone-600 hover:bg-stone-50 h-8">
                  <Download className="size-3.5 mr-1.5" />CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {toolUsageData.length === 0 ? (
                <EmptyChart message="Sin préstamos registrados aún" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={toolUsageData} layout="horizontal" barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e3de" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#6e6b64' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12, fill: '#6e6b64' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e3de', borderRadius: 4 }} />
                    <Bar dataKey="count" fill="#1d5e8c" name="Veces prestada" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfica de préstamos por profesor */}
          {loansByProfessor.length > 0 && (
            <Card className="border-stone-200 shadow-none">
              <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
                  <User className="size-4 text-stone-400" />
                  Préstamos por Profesor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={loansByProfessor} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e3de" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6e6b64' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6e6b64' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e3de', borderRadius: 4 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="enCurso" fill="#1d5e8c" name="En curso (uso)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="liquidados" fill="#2e7d32" name="Liquidados (uso)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ══════════ INCIDENCIAS ══════════ */}
        <TabsContent value="incidents" className="space-y-5">
          {/* KPIs de incidencias */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 text-center">
              <p className="text-3xl font-light text-stone-800">{incidents.length}</p>
              <p className="text-xs text-stone-500 mt-0.5">Total incidencias</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 text-center">
              <p className="text-3xl font-light text-amber-700">{incidents.filter(i => i.status === 'Pendiente').length}</p>
              <p className="text-xs text-amber-600 mt-0.5">Pendientes</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-4 text-center">
              <p className="text-3xl font-light text-emerald-700">{incidents.filter(i => i.status === 'Resuelto').length}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Resueltas</p>
            </div>
          </div>

          <Card className="border-stone-200 shadow-none">
            <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
                <AlertTriangle className="size-4 text-stone-400" />
                Incidencias Registradas
              </CardTitle>
              <ExportButtons />
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {incidents.length === 0 ? (
                  <div className="col-span-2">
                    <EmptyChart message="No hay incidencias registradas" />
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={incidentsByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {incidentsByType.map((entry, index) => (
                            <Cell key={`cell-incident-${index}`} fill={INCIDENT_COLORS[index % INCIDENT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e3de', borderRadius: 4 }} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-2.5">
                      {incidentsByType.map((it, idx) => (
                        <div key={it.name} className="border border-stone-200 rounded-sm p-3.5 flex items-center gap-3">
                          <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: INCIDENT_COLORS[idx] }} />
                          <div className="flex-1">
                            <p className="text-xs text-stone-500 uppercase tracking-wide">{it.name}</p>
                            <p className="text-xl font-light text-stone-800">{it.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {incidents.length > 0 && (
                <div className="mt-5 border border-stone-200 rounded-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-stone-50 border-b border-stone-200">
                      <tr>
                        <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Fecha</th>
                        <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Herramienta</th>
                        <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Tipo</th>
                        <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Estudiante</th>
                        <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {incidents.map((incident) => (
                        <tr key={incident.id} className="hover:bg-stone-50">
                          <td className="py-2.5 px-4 text-xs text-stone-500">{incident.date}</td>
                          <td className="py-2.5 px-4 text-sm text-stone-700">{incident.tool}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 text-xs rounded-sm font-medium ${
                              incident.type === 'Daño' ? 'bg-red-50 text-red-700 border border-red-200' :
                              incident.type === 'Pérdida' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {incident.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-xs text-stone-500">{incident.student}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 text-xs rounded-sm font-medium ${
                              incident.status === 'Pendiente'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {incident.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════ PRÉSTAMOS ══════════ */}
        <TabsContent value="loans" className="space-y-5">
          {/* KPIs préstamos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4">
              <p className="text-xs text-stone-500 uppercase tracking-wide">Total préstamos</p>
              <p className="text-3xl font-light text-[#1d5e8c] mt-1">{loans.length}</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4">
              <p className="text-xs text-stone-500 uppercase tracking-wide">En curso</p>
              <p className="text-3xl font-light text-amber-700 mt-1">
                {loans.filter(l => l.status === 'En curso').length}
              </p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4">
              <p className="text-xs text-stone-500 uppercase tracking-wide">Liquidados</p>
              <p className="text-3xl font-light text-emerald-700 mt-1">
                {loans.filter(l => l.status === 'Liquidado').length}
              </p>
            </div>
          </div>

          {/* Gráfica de préstamos por profesor */}
          {loansByProfessor.length > 0 && (
            <Card className="border-stone-200 shadow-none">
              <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
                  <User className="size-4 text-stone-400" />
                  Préstamos por Profesor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={loansByProfessor} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e3de" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6e6b64' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6e6b64' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, border: '1px solid #e5e3de', borderRadius: 4 }}
                      formatter={(val, name, props) => [val, name]}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="enCurso" fill="#1d5e8c" name="En curso (préstamos)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="liquidados" fill="#2e7d32" name="Liquidados (préstamos)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="border-stone-200 shadow-none">
            <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
                <User className="size-4 text-stone-400" />
                Detalle de Préstamos
              </CardTitle>
              <ExportButtons />
            </CardHeader>
            <CardContent className="p-5">
              {loans.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-sm">No hay préstamos registrados</div>
              ) : (
                <div className="border border-stone-200 rounded-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-stone-50 border-b border-stone-200">
                      <tr>
                        <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Préstamo</th>
                        <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Profesor</th>
                        <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Fecha</th>
                        <th className="text-center py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Herramientas</th>
                        <th className="text-left py-2.5 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {loans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-stone-50">
                          <td className="py-2.5 px-4 font-mono text-xs text-stone-500">#{loan.id.slice(-6)}</td>
                          <td className="py-2.5 px-4 text-sm text-stone-700">{loan.professor}</td>
                          <td className="py-2.5 px-4 text-xs text-stone-500">{loan.date}</td>
                          <td className="text-center py-2.5 px-4 text-sm text-stone-700">{loan.tools.length}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 text-xs rounded-sm font-medium ${
                              loan.status === 'Liquidado'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {loan.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar, AlertTriangle, ClipboardList, Wrench, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAppStore } from '../store/AppStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const TOOL_TYPES = [
  { name: 'Herramienta de mano', short: 'Mano' },
  { name: 'Herramienta eléctrica', short: 'Eléctrica' },
  { name: 'Instrumento de medición', short: 'Medición' },
];

export function Dashboard() {
  const { reservations, loans, incidents, tools } = useAppStore();

  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(r => r.date === today);
  const activeLoans = loans.filter(l => l.status === 'En curso');
  const recentIncidents = incidents.slice(0, 3);

  const totalAvailable = tools.filter(t => t.status === 'Disponible').length;
  const totalTools = tools.length;

  const toolAvailabilityData = TOOL_TYPES.map((tt, index) => ({
    name: tt.short,
    Disponibles: tools.filter(t => t.type === tt.name && t.status === 'Disponible').length,
    Ocupadas: tools.filter(t => t.type === tt.name && (t.status === 'Reservada' || t.status === 'Prestada')).length,
    _key: `tool-avail-${index}`,
  }));

  return (
    <div className="space-y-7">
      {/* Hero Banner */}
      <div className="relative rounded-md overflow-hidden h-48 md:h-56">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1761120812739-bf07c61d3455?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMG1lYWRvdyUyMGdyYXNzbGFuZCUyMGZhcm0lMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzc0NjQ1MzgxfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Pradera agrícola"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1a2535]/72 flex flex-col justify-end p-6 md:p-8">
          <h1 className="text-white">Panel de Control</h1>
          <p className="text-stone-300 text-sm mt-1">
            Resumen de actividades del día —{' '}
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-stone-200 rounded-md p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-[#e8f0f8] rounded flex items-center justify-center shrink-0">
            <Calendar className="size-4 text-[#1d5e8c]" />
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Reservas de Hoy</p>
            <p className="text-3xl font-light text-[#1a1819] mt-0.5">{todayReservations.length}</p>
            <p className="text-xs text-stone-400 mt-1">
              {todayReservations.filter(r => r.status === 'Confirmada').length} confirmadas
            </p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-md p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-[#eaf4eb] rounded flex items-center justify-center shrink-0">
            <ClipboardList className="size-4 text-[#2e7d32]" />
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Préstamos Abiertos</p>
            <p className="text-3xl font-light text-[#1a1819] mt-0.5">{activeLoans.length}</p>
            <p className="text-xs text-stone-400 mt-1">
              {activeLoans.reduce((acc, l) => acc + l.tools.length, 0)} herramientas en uso
            </p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-md p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-[#faeaea] rounded flex items-center justify-center shrink-0">
            <AlertTriangle className="size-4 text-[#b32020]" />
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Incidencias Recientes</p>
            <p className="text-3xl font-light text-[#1a1819] mt-0.5">{recentIncidents.length}</p>
            <p className="text-xs text-stone-400 mt-1">
              {recentIncidents.filter(i => i.status === 'Pendiente').length} pendientes
            </p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-md p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-[#eaf4eb] rounded flex items-center justify-center shrink-0">
            <Package className="size-4 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Disponibles Ahora</p>
            <p className="text-3xl font-light text-emerald-700 mt-0.5">{totalAvailable}</p>
            <p className="text-xs text-stone-400 mt-1">
              de {totalTools} en inventario
            </p>
          </div>
        </div>
      </div>

      {/* Quick Visual — Taller en acción */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative rounded-md overflow-hidden h-36 md:col-span-2">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1681705357021-d5434018247b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMHN0dWRlbnRzJTIwbGVhcm5pbmclMjBmYXJtJTIwZWR1Y2F0aW9uJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NzQ2NDUzODN8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Estudiantes en campo agrícola"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1a2535]/55 flex flex-col justify-end p-4">
            <p className="text-white text-xs uppercase tracking-widest font-medium">Formación Técnica</p>
            <p className="text-stone-300 text-xs mt-0.5">Gestión de herramientas para el aprendizaje práctico</p>
          </div>
        </div>
        <div className="relative rounded-md overflow-hidden h-36">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1583266748831-f8fb1db0eb29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBoYW5kJTIwdG9vbHMlMjBmYXJtJTIwc2hvdmVsJTIwaG9lJTIwcmFrZXxlbnwxfHx8fDE3NzQ2NDUzODB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Herramientas agrícolas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1a2535]/55 flex flex-col justify-end p-4">
            <p className="text-white text-xs uppercase tracking-widest font-medium">Inventario Activo</p>
            <p className="text-stone-300 text-xs mt-0.5">{activeLoans.reduce((acc, l) => acc + l.tools.length, 0)} herramientas en circulación</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Reservas de Hoy */}
        <Card className="border-stone-200 shadow-none">
          <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <Calendar className="size-4 text-[#1d5e8c]" />
              Reservas de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {todayReservations.length > 0 ? (
              <div className="space-y-3">
                {todayReservations.map((reservation) => (
                  <div key={reservation.id} className="border border-stone-200 rounded-sm p-4 hover:border-stone-300 transition-colors bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-stone-800">{reservation.professor}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{reservation.timeBlock}</p>
                        <div className="mt-2.5 space-y-0.5">
                          {reservation.tools.map((tool, toolIndex) => (
                            <p key={`${reservation.id}-tool-${toolIndex}`} className="text-xs text-stone-500 flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-stone-400 rounded-full shrink-0"></span>
                              <span className="font-mono text-[#1d5e8c]">{tool.toolCode}</span>
                              <span>— {tool.toolName}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                      <span className={`
                        px-2 py-0.5 text-xs rounded-sm font-medium shrink-0
                        ${reservation.status === 'Confirmada'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'}
                      `}>
                        {reservation.status}
                      </span>
                    </div>
                    <Link to={`/reservations/${reservation.id}`}>
                      <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-[#1d5e8c] hover:text-[#164e76] font-medium py-1.5 border border-[#1d5e8c]/20 hover:border-[#1d5e8c]/40 rounded-sm transition-colors">
                        Ver Detalles
                        <ArrowRight className="size-3" />
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-400 text-sm text-center py-8">No hay reservas para hoy</p>
            )}
          </CardContent>
        </Card>

        {/* Préstamos Activos */}
        <Card className="border-stone-200 shadow-none">
          <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <ClipboardList className="size-4 text-[#2e7d32]" />
              Préstamos Activos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {activeLoans.length > 0 ? (
              <div className="space-y-3">
                {activeLoans.map((loan) => (
                  <div key={loan.id} className="border border-stone-200 rounded-sm p-4 hover:border-stone-300 transition-colors bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-stone-800">{loan.professor}</p>
                        <p className="text-xs text-stone-500 mt-0.5">Préstamo #{loan.id}</p>
                      </div>
                      <span className="px-2 py-0.5 text-xs rounded-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        {loan.status}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mb-3 bg-stone-50 rounded-sm px-3 py-2 border border-stone-100">
                      {loan.tools.filter(t => t.returned).length} / {loan.tools.length} herramientas devueltas
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/loans/${loan.id}/delivery`} className="flex-1">
                        <button className="w-full text-xs font-medium py-1.5 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-sm text-stone-600 transition-colors">
                          Entrega
                        </button>
                      </Link>
                      <Link to={`/loans/${loan.id}/return`} className="flex-1">
                        <button className="w-full text-xs font-medium py-1.5 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-sm text-stone-600 transition-colors">
                          Devolución
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-400 text-sm text-center py-8">No hay préstamos activos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tool Availability Chart */}
      {totalTools > 0 && (
        <Card className="border-stone-200 shadow-none">
          <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <Wrench className="size-4 text-stone-400" />
              Disponibilidad de Herramientas por Tipo
            </CardTitle>
            <Link to="/tools" className="text-xs text-[#1d5e8c] hover:underline">
              Ver inventario →
            </Link>
          </CardHeader>
          <CardContent className="p-5">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={toolAvailabilityData} barSize={24} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e3de" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6e6b64' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6e6b64' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e3de', borderRadius: 4 }} />
                <Bar dataKey="Disponibles" fill="#2e7d32" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Ocupadas" fill="#b07d2a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Incidencias Recientes */}
      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-stone-700">
            <AlertTriangle className="size-4 text-[#b32020]" />
            Incidencias Recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {recentIncidents.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="flex items-start justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Wrench className="size-3.5 text-stone-400 shrink-0" />
                      <span className="text-sm font-medium text-stone-800">{incident.tool}</span>
                      <span className={`
                        px-2 py-0.5 text-xs rounded-sm font-medium
                        ${incident.type === 'Daño' ? 'bg-red-50 text-red-700 border border-red-200' :
                          incident.type === 'Pérdida' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'}
                      `}>
                        {incident.type}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1.5 ml-5">{incident.description}</p>
                    <p className="text-xs text-stone-400 mt-1 ml-5">
                      Estudiante: {incident.student} · {incident.date}
                    </p>
                  </div>
                  <span className={`
                    px-2 py-0.5 text-xs rounded-sm font-medium whitespace-nowrap ml-4 shrink-0
                    ${incident.status === 'Pendiente'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}
                  `}>
                    {incident.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-400 text-sm text-center py-8">No hay incidencias recientes</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
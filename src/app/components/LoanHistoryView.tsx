import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  History, Search, ChevronDown, ChevronUp, CheckCircle, AlertTriangle,
  Calendar, User, BookOpen, Wrench, XCircle,
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';
import type { LoanHistory } from '../data/mockData';

export function LoanHistoryView() {
  const { history, userRole, userName } = useAppStore();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isAdmin = userRole === 'admin';

  // Professors only see their own history
  const myHistory = isAdmin
    ? history
    : history.filter(h => h.professor === userName);

  const filtered = myHistory.filter(h => {
    const q = search.toLowerCase();
    return (
      h.professor.toLowerCase().includes(q) ||
      (h.studentName ?? '').toLowerCase().includes(q) ||
      (h.studentCode ?? '').toLowerCase().includes(q) ||
      h.loanId.includes(q)
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const totalTools = myHistory.reduce((acc, h) => acc + h.tools.length, 0);
  const totalIncidents = myHistory.reduce((acc, h) => acc + h.incidentsCount, 0);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="pb-5 border-b border-stone-200">
        <h1 className="text-[#1a1819]">
          {isAdmin ? 'Historial de Préstamos' : 'Mi Historial de Préstamos'}
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {isAdmin
            ? 'Registro de todos los préstamos liquidados'
            : 'Sus préstamos finalizados y liquidados'}
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-sm p-4 text-center">
          <p className="text-3xl font-light text-[#1a2535]">{myHistory.length}</p>
          <p className="text-xs text-stone-500 mt-0.5">Préstamos archivados</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-sm p-4 text-center">
          <p className="text-3xl font-light text-emerald-700">{totalTools}</p>
          <p className="text-xs text-stone-500 mt-0.5">Herramientas gestionadas</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-sm p-4 text-center">
          <p className="text-3xl font-light text-amber-700">{totalIncidents}</p>
          <p className="text-xs text-stone-500 mt-0.5">Incidencias registradas</p>
        </div>
      </div>

      {/* Search */}
      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
            <Search className="size-4 text-stone-400" />
            Buscar en el historial
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
            <Input
              placeholder="Buscar por profesor, estudiante, código o ID de préstamo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-stone-200 bg-[#f8f7f4] text-sm h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* History list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-stone-300 rounded-sm bg-white">
            <History className="size-8 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400 text-sm">
              {myHistory.length === 0
                ? 'No hay préstamos archivados todavía'
                : 'No hay resultados para esa búsqueda'}
            </p>
            <p className="text-stone-400 text-xs mt-1">
              {myHistory.length === 0
                ? 'Los préstamos liquidados aparecerán aquí automáticamente'
                : 'Intente con otros términos de búsqueda'}
            </p>
          </div>
        ) : (
          filtered.map((record) => (
            <HistoryCard
              key={record.id}
              record={record}
              isExpanded={expandedId === record.id}
              onToggle={() => toggleExpand(record.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function HistoryCard({
  record,
  isExpanded,
  onToggle,
}: {
  record: LoanHistory;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasIncidents = record.incidentsCount > 0;

  return (
    <Card className="border-stone-200 shadow-none overflow-hidden">
      {/* Card header row */}
      <button
        className="w-full text-left px-5 py-4 hover:bg-stone-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Status icon */}
            <div className="mt-0.5 shrink-0">
              {hasIncidents ? (
                <div className="w-8 h-8 rounded-sm bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <AlertTriangle className="size-4 text-amber-600" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-sm bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle className="size-4 text-emerald-600" />
                </div>
              )}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-stone-800 truncate">
                  {record.professor}
                </span>
                {record.studentName && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span className="text-sm text-stone-600 truncate">{record.studentName}</span>
                  </>
                )}
                {record.studentCode && (
                  <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                    {record.studentCode}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-stone-500">
                  <Calendar className="size-3" />
                  {record.startDate} → {record.endDate}
                </span>
                <span className="flex items-center gap-1 text-xs text-stone-500">
                  <Wrench className="size-3" />
                  {record.tools.length} herramienta{record.tools.length !== 1 ? 's' : ''}
                </span>
                {hasIncidents && (
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="size-3" />
                    {record.incidentsCount} incidencia{record.incidentsCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:block text-xs text-stone-400 font-mono">#{record.loanId.slice(-8)}</span>
            <div className="px-2 py-0.5 rounded-sm text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
              Liquidado
            </div>
            {isExpanded
              ? <ChevronUp className="size-4 text-stone-400" />
              : <ChevronDown className="size-4 text-stone-400" />
            }
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-stone-100 bg-stone-50 px-5 py-4 space-y-4">

          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoCell label="ID Préstamo" value={`#${record.loanId.slice(-8)}`} mono />
            <InfoCell label="Fecha inicio" value={record.startDate} />
            <InfoCell label="Fecha liquidación" value={record.endDate} />
            <InfoCell label="Reserva" value={record.reservationId ? `#${record.reservationId.slice(-8)}` : '—'} mono />
          </div>

          {(record.studentName || record.studentCode) && (
            <div className="flex gap-4 p-3 bg-white border border-stone-200 rounded-sm">
              <User className="size-4 text-stone-400 shrink-0 mt-0.5" />
              <div className="flex gap-6 flex-wrap">
                {record.studentName && (
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wide">Estudiante</p>
                    <p className="text-sm font-medium text-stone-800">{record.studentName}</p>
                  </div>
                )}
                {record.studentCode && (
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wide">Código</p>
                    <p className="text-sm font-mono font-medium text-stone-800">{record.studentCode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tools list */}
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BookOpen className="size-3.5" />
              Herramientas del préstamo
            </p>
            <div className="border border-stone-200 rounded-sm divide-y divide-stone-100 bg-white">
              {record.tools.map((tool) => (
                <div key={tool.toolId} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-stone-800">{tool.toolName}</p>
                    {tool.student && (
                      <p className="text-xs text-stone-500 mt-0.5">Asignada a: {tool.student}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {tool.state === 'Incidencia' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-sm font-medium bg-red-50 text-red-700 border border-red-200">
                        <AlertTriangle className="size-3" />
                        Incidencia
                      </span>
                    ) : tool.returned ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="size-3" />
                        Devuelta OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-sm font-medium bg-stone-100 text-stone-600 border border-stone-200">
                        <XCircle className="size-3" />
                        Sin verificar
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function InfoCell({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-white border border-stone-200 rounded-sm p-2.5">
      <p className="text-xs text-stone-500 uppercase tracking-wide">{label}</p>
      <p className={`text-sm text-stone-800 mt-0.5 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</p>
    </div>
  );
}
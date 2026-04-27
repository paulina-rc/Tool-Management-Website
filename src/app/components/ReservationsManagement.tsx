import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import {
  Calendar, Plus, Trash2, Edit, CheckCircle, Search, AlertCircle,
  Clock, Package, ArrowRight, X, Wrench, MapPin, Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/AppStore';
import type { Reservation, Tool } from '../data/mockData';

const TIME_BLOCKS: Reservation['timeBlock'][] = ['Día completo', 'Mañana', 'Tarde'];

const TYPE_COLORS: Record<string, string> = {
  'Herramienta de mano':      'bg-blue-50 text-blue-700 border-blue-200',
  'Herramienta eléctrica':    'bg-amber-50 text-amber-700 border-amber-200',
  'Instrumento de medición':  'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function ReservationsManagement() {
  const {
    reservations, tools, batchUpdateTools,
    addReservation, updateReservation, removeReservation,
    userRole, userName,
  } = useAppStore();

  const isAdmin = userRole === 'admin';

  // Professors only see their own reservations
  const myReservations = isAdmin
    ? reservations
    : reservations.filter(r => r.professor === userName);

  // ── List state ────────────────────────────────────────────────────────────
  const [listSearch, setListSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // ── Form state ────────────────────────────────────────────────────────────
  const [professor, setProfessor] = useState('');
  const [date, setDate] = useState('');
  const [timeBlock, setTimeBlock] = useState<Reservation['timeBlock'] | ''>('');
  const [notes, setNotes] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [toolSearch, setToolSearch] = useState('');
  // Map: toolId → Tool object (preserves insertion order)
  const [selectedTools, setSelectedTools] = useState<Map<string, Tool>>(new Map());

  // ── Tool picker data ──────────────────────────────────────────────────────
  // IDs already locked by other confirmed reservations (excluding the one being edited)
  const lockedByOthers = useMemo(() => {
    const ids = new Set<string>();
    reservations.forEach(r => {
      if (r.id === editId) return; // allow re-selection of own tools when editing
      if (r.status === 'Cancelada') return;
      (r.reservedToolIds ?? []).forEach(id => ids.add(id));
    });
    return ids;
  }, [reservations, editId]);

  // Available tools for selection: status Disponible OR already selected in this form
  const pickerTools = useMemo(() => {
    return tools.filter(t => {
      if (selectedTools.has(t.id)) return true; // already selected → keep visible
      if (t.status !== 'Disponible') return false;
      if (lockedByOthers.has(t.id)) return false;
      return true;
    });
  }, [tools, selectedTools, lockedByOthers]);

  // Filter by search query
  const filteredPickerTools = useMemo(() => {
    const q = toolSearch.toLowerCase();
    if (!q) return pickerTools;
    return pickerTools.filter(t =>
      t.code.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q)
    );
  }, [pickerTools, toolSearch]);

  // Group filtered tools by type
  const toolsByType = useMemo(() => {
    const map = new Map<string, Tool[]>();
    filteredPickerTools.forEach(t => {
      const arr = map.get(t.type) ?? [];
      arr.push(t);
      map.set(t.type, arr);
    });
    return map;
  }, [filteredPickerTools]);

  // Summary bar
  const availableCount = tools.filter(t => t.status === 'Disponible' && !lockedByOthers.has(t.id)).length;

  // ── Form helpers ─────────────────────────────────────────────────────────
  const resetForm = () => {
    setProfessor(isAdmin ? '' : userName);
    setDate('');
    setTimeBlock('');
    setNotes('');
    setStudentCode('');
    setStudentName('');
    setToolSearch('');
    setSelectedTools(new Map());
    setEditId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (r: Reservation) => {
    if (!isAdmin && r.professor !== userName) {
      toast.error('Solo puede editar sus propias reservas');
      return;
    }
    setProfessor(r.professor);
    setDate(r.date);
    setTimeBlock(r.timeBlock);
    setNotes(r.notes ?? '');
    setStudentCode(r.studentCode ?? '');
    setStudentName(r.studentName ?? '');
    setToolSearch('');

    // Pre-select the tools saved in this reservation
    const map = new Map<string, Tool>();
    r.tools.forEach(rt => {
      const tool = tools.find(t => t.id === rt.toolId);
      if (tool) map.set(tool.id, tool);
    });
    setSelectedTools(map);
    setEditId(r.id);
    setShowForm(true);
  };

  const handleDelete = (r: Reservation) => {
    if (!isAdmin && r.professor !== userName) {
      toast.error('Solo puede eliminar sus propias reservas');
      return;
    }
    if (r.status !== 'Cancelada' && r.reservedToolIds?.length) {
      batchUpdateTools(r.reservedToolIds.map(id => ({ id, updates: { status: 'Disponible' as const } })));
    }
    removeReservation(r.id);
    toast.success('Reserva eliminada');
  };

  const toggleToolSelection = (tool: Tool) => {
    setSelectedTools(prev => {
      const next = new Map(prev);
      if (next.has(tool.id)) {
        next.delete(tool.id);
      } else {
        next.set(tool.id, tool);
      }
      return next;
    });
  };

  const removeSelectedTool = (toolId: string) => {
    setSelectedTools(prev => {
      const next = new Map(prev);
      next.delete(toolId);
      return next;
    });
  };

  const handleSubmit = () => {
    const prof = isAdmin ? professor.trim() : userName;
    if (!prof) { toast.error('Ingrese el nombre del profesor'); return; }
    if (!date) { toast.error('Seleccione una fecha'); return; }
    if (!timeBlock) { toast.error('Seleccione un bloque horario'); return; }
    if (selectedTools.size === 0) { toast.error('Debe seleccionar al menos una herramienta'); return; }

    const newId = editId || String(Date.now());

    // Release previously reserved tools when editing
    if (editId) {
      const existing = reservations.find(r => r.id === editId);
      if (existing?.reservedToolIds?.length) {
        batchUpdateTools(existing.reservedToolIds.map(id => ({ id, updates: { status: 'Disponible' as const } })));
      }
    }

    // Mark selected tools as Reservada
    const toolList = Array.from(selectedTools.values());
    const reservedToolIds = toolList.map(t => t.id);
    batchUpdateTools(toolList.map(t => ({ id: t.id, updates: { status: 'Reservada' as const } })));

    const reservation: Reservation = {
      id: newId,
      date,
      timeBlock: timeBlock as Reservation['timeBlock'],
      professor: prof,
      studentCode: studentCode.trim() || undefined,
      studentName: studentName.trim() || undefined,
      notes: notes.trim() || undefined,
      status: 'Confirmada',
      tools: toolList.map(t => ({
        toolId: t.id,
        toolCode: t.code,
        toolName: t.name,
        toolType: t.type,
      })),
      reservedToolIds,
    };

    if (editId) {
      updateReservation(editId, reservation);
      toast.success('Reserva actualizada exitosamente');
    } else {
      addReservation(reservation);
      toast.success(`Reserva confirmada · ${reservedToolIds.length} herramienta(s) reservada(s)`);
    }

    setShowForm(false);
    resetForm();
  };

  // ── List filtering ────────────────────────────────────────────────────────
  const filteredList = myReservations.filter(r => {
    const q = listSearch.toLowerCase();
    return (
      r.professor.toLowerCase().includes(q) ||
      r.date.includes(q) ||
      r.id.includes(q) ||
      r.tools.some(t => t.toolCode.toLowerCase().includes(q) || t.toolName.toLowerCase().includes(q))
    );
  });

  const getStatusStyle = (status: string) => {
    if (status === 'Confirmada') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (status === 'Pendiente')  return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="pb-5 border-b border-stone-200 flex items-start justify-between">
        <div>
          <h1 className="text-[#1a1819]">{isAdmin ? 'Gestión de Reservas' : 'Mis Reservas'}</h1>
          <p className="text-stone-500 text-sm mt-1">
            {isAdmin ? 'Administrar todas las reservas del sistema' : 'Gestione sus reservas de herramientas'}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#1a2535] hover:bg-[#243347] text-white">
          <Plus className="size-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {/* Inventory summary */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from(
          tools.reduce((map, t) => {
            const entry = map.get(t.type) ?? { total: 0, available: 0 };
            entry.total++;
            if (t.status === 'Disponible') entry.available++;
            map.set(t.type, entry);
            return map;
          }, new Map<string, { total: number; available: number }>())
        ).map(([type, counts]) => (
          <div key={type} className="bg-white border border-stone-200 rounded-sm p-3 text-center">
            <p className="text-2xl font-light text-emerald-700">{counts.available}</p>
            <p className="text-xs text-stone-500 mt-0.5 truncate">
              {type.replace('Herramienta de ', '').replace('Herramienta ', '').replace('Instrumento de ', 'Med. ')}
            </p>
            <p className="text-xs text-stone-400">de {counts.total}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
        <Input
          placeholder="Buscar por profesor, fecha, código o nombre de herramienta..."
          value={listSearch}
          onChange={(e) => setListSearch(e.target.value)}
          className="pl-9 border-stone-200 bg-white text-sm h-9"
        />
      </div>

      {/* Reservations list */}
      {filteredList.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-300 rounded-sm bg-white">
          <Calendar className="size-8 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">
            {myReservations.length === 0 ? 'No hay reservas registradas' : 'Sin resultados para esa búsqueda'}
          </p>
          <p className="text-stone-400 text-xs mt-1">Cree una nueva reserva con el botón superior</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((r) => {
            const canEdit = isAdmin || r.professor === userName;
            return (
              <Card key={r.id} className="border-stone-200 shadow-none hover:border-stone-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-sm font-medium text-stone-800">{r.professor}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-sm font-medium shrink-0 ${getStatusStyle(r.status)}`}>
                          {r.status}
                        </span>
                        <span className="text-xs font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                          #{r.id.slice(-6)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap mb-2">
                        <span className="flex items-center gap-1.5 text-xs text-stone-500">
                          <Calendar className="size-3" />
                          {new Date(r.date + 'T00:00:00').toLocaleDateString('es-ES', {
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-stone-500">
                          <Clock className="size-3" />
                          {r.timeBlock}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-stone-500">
                          <Package className="size-3" />
                          {r.tools.length} herramienta{r.tools.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {r.notes && (
                        <p className="text-xs text-stone-400 italic mb-2">{r.notes}</p>
                      )}

                      {/* Tool chips */}
                      <div className="flex flex-wrap gap-1">
                        {r.tools.map((t) => (
                          <span
                            key={t.toolId}
                            className="inline-flex items-center gap-1 text-xs bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded-sm font-mono"
                          >
                            {t.toolCode}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Link to={`/reservations/${r.id}`}>
                        <Button variant="ghost" className="h-8 px-2 text-stone-500 hover:text-[#1d5e8c] hover:bg-[#1d5e8c]/5">
                          <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                      {canEdit && r.status !== 'Cancelada' && (
                        <Button
                          variant="ghost"
                          onClick={() => openEdit(r)}
                          className="h-8 px-2 text-stone-500 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Edit className="size-4" />
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(r)}
                          className="h-8 px-2 text-stone-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Dialog ──────────────────────────────────────────── */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="bg-white border-stone-200 max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1a1819]">
              {editId ? 'Editar Reserva' : 'Nueva Reserva'}
            </DialogTitle>
            <DialogDescription className="text-stone-500 text-sm">
              {editId
                ? 'Modifique los datos de la reserva'
                : 'Seleccione herramientas específicas por código para reservar'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">

            {/* ── General info ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-500 uppercase tracking-wide">Profesor Responsable</Label>
                {isAdmin ? (
                  <Input
                    placeholder="Nombre del profesor"
                    value={professor}
                    onChange={(e) => setProfessor(e.target.value)}
                    className="border-stone-200 bg-[#f8f7f4] text-sm h-9"
                  />
                ) : (
                  <div className="border border-stone-200 rounded-md px-3 py-2 bg-stone-50 text-sm text-stone-700 h-9 flex items-center">
                    {userName}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-500 uppercase tracking-wide">Fecha</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-stone-200 bg-[#f8f7f4] text-sm h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-500 uppercase tracking-wide">Código del Estudiante</Label>
                <Input
                  placeholder="Ej. EST-2024-0123"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="border-stone-200 bg-[#f8f7f4] text-sm h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-500 uppercase tracking-wide">Nombre del Estudiante</Label>
                <Input
                  placeholder="Nombre completo del estudiante"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="border-stone-200 bg-[#f8f7f4] text-sm h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-500 uppercase tracking-wide">Bloque Horario</Label>
                <Select value={timeBlock} onValueChange={(v) => setTimeBlock(v as Reservation['timeBlock'])}>
                  <SelectTrigger className="border-stone-200 bg-[#f8f7f4] text-sm h-9 text-stone-700">
                    <SelectValue placeholder="Seleccione el bloque horario" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_BLOCKS.map(tb => (
                      <SelectItem key={tb} value={tb}>
                        {tb === 'Mañana' ? 'Mañana (8:00 – 12:00)' : tb === 'Tarde' ? 'Tarde (13:00 – 17:00)' : tb}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-stone-500 uppercase tracking-wide">Observaciones (opcional)</Label>
                <Textarea
                  placeholder="Notas adicionales..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={1}
                  className="border-stone-200 bg-[#f8f7f4] text-sm resize-none"
                />
              </div>
            </div>

            {/* ── Tool picker ───────────────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-stone-500 uppercase tracking-wide">
                  Seleccionar Herramientas
                </Label>
                <span className="text-xs text-stone-400">
                  {availableCount} disponibles · {selectedTools.size} seleccionada{selectedTools.size !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
                <Input
                  placeholder="Buscar por código (HM-001), nombre o tipo..."
                  value={toolSearch}
                  onChange={(e) => setToolSearch(e.target.value)}
                  className="pl-9 border-stone-200 bg-[#f8f7f4] text-sm h-9"
                />
              </div>

              {/* Tool list */}
              <div className="border border-stone-200 rounded-sm max-h-56 overflow-y-auto divide-y divide-stone-100 bg-white">
                {filteredPickerTools.length === 0 ? (
                  <div className="text-center py-8 text-stone-400 text-sm">
                    <Wrench className="size-5 mx-auto mb-2 text-stone-300" />
                    {toolSearch ? 'Sin resultados para esa búsqueda' : 'No hay herramientas disponibles'}
                  </div>
                ) : (
                  Array.from(toolsByType.entries()).map(([type, typeTools]) => (
                    <div key={type}>
                      <div className="px-3 py-1.5 bg-stone-50 border-b border-stone-100 sticky top-0">
                        <p className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">{type}</p>
                      </div>
                      {typeTools.map(tool => {
                        const isSelected = selectedTools.has(tool.id);
                        return (
                          <div
                            key={tool.id}
                            onClick={() => toggleToolSelection(tool)}
                            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#1d5e8c]/5' : 'hover:bg-stone-50'
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleToolSelection(tool)}
                              onClick={e => e.stopPropagation()}
                              className="shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-medium text-[#1d5e8c] bg-[#1d5e8c]/8 px-1.5 py-0.5 rounded-sm">
                                  {tool.code}
                                </span>
                                <span className="text-sm text-stone-800 truncate">{tool.name}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1 text-xs text-stone-400">
                                  <MapPin className="size-2.5" />
                                  {tool.location}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle className="size-4 text-[#1d5e8c] shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Selected tools summary ────────────────────────────────── */}
            {selectedTools.size > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-stone-500 uppercase tracking-wide">
                  Herramientas Seleccionadas ({selectedTools.size})
                </Label>
                <div className="border border-stone-200 rounded-sm divide-y divide-stone-100">
                  {Array.from(selectedTools.values()).map(tool => (
                    <div key={tool.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-medium text-[#1d5e8c] bg-[#1d5e8c]/8 px-1.5 py-0.5 rounded-sm">
                            {tool.code}
                          </span>
                          <span className="text-sm text-stone-800 truncate">{tool.name}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-px rounded-sm border ${TYPE_COLORS[tool.type] ?? 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                            {tool.type}
                          </span>
                          <span className="text-xs text-stone-400">{tool.location}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedTool(tool.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5 p-3 border border-amber-200 bg-amber-50 rounded-sm">
              <AlertCircle className="size-3.5 text-amber-700 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                Las herramientas seleccionadas quedarán marcadas como <strong>Reservada</strong> en el inventario al confirmar.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button onClick={handleSubmit} className="bg-[#1a2535] hover:bg-[#243347] text-white">
                <CheckCircle className="size-4 mr-2" />
                {editId ? 'Guardar Cambios' : 'Crear Reserva'}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

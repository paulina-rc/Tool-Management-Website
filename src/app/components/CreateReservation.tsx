import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Plus, Trash2, CheckCircle, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/AppStore';
import type { Reservation } from '../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// Tipos canónicos de herramientas (deben coincidir con los del inventario)
const TOOL_TYPES = [
  { name: 'Herramienta de mano', label: 'Herramientas de Mano' },
  { name: 'Herramienta eléctrica', label: 'Herramientas Eléctricas' },
  { name: 'Instrumento de medición', label: 'Instrumentos de Medición' },
];

export function CreateReservation() {
  const navigate = useNavigate();
  const { addReservation, reservations, tools, batchUpdateTools } = useAppStore();

  const [professor, setProfessor] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [date, setDate] = useState('');
  const [timeBlock, setTimeBlock] = useState<Reservation['timeBlock'] | ''>('');
  const [selectedItems, setSelectedItems] = useState<Array<{ type: string; quantity: number }>>([]);
  const [selectedType, setSelectedType] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Calcular disponibilidad real desde el inventario
  const availabilityByType = TOOL_TYPES.map(tt => ({
    name: tt.label,
    typeName: tt.name,
    disponibles: tools.filter(t => t.type === tt.name && t.status === 'Disponible').length,
    reservadas: tools.filter(t => t.type === tt.name && t.status === 'Reservada').length,
    prestadas: tools.filter(t => t.type === tt.name && t.status === 'Prestada').length,
    total: tools.filter(t => t.type === tt.name).length,
  }));

  const chartData = availabilityByType.map((a, index) => ({
    name: a.name.replace('Herramientas de ', '').replace('Herramientas ', '').replace('Instrumentos de ', 'Med. '),
    Disponibles: a.disponibles,
    Reservadas: a.reservadas,
    Prestadas: a.prestadas,
    _key: `avail-chart-${index}`,
  }));

  const addItem = () => {
    if (!selectedType) {
      toast.error('Seleccione un tipo de herramienta');
      return;
    }
    if (quantity < 1) {
      toast.error('La cantidad debe ser al menos 1');
      return;
    }
    if (selectedItems.find(t => t.type === selectedType)) {
      toast.error('Ya agregó ese tipo de herramienta. Elimínelo primero para modificar.');
      return;
    }
    const available = availabilityByType.find(a => a.typeName === selectedType)?.disponibles ?? 0;
    if (tools.length > 0 && quantity > available) {
      toast.warning(`Solo hay ${available} unidades disponibles de este tipo`, {
        description: 'Se reservarán las unidades disponibles',
      });
    }
    setSelectedItems([...selectedItems, { type: selectedType, quantity }]);
    setSelectedType('');
    setQuantity(1);
    toast.success('Herramienta agregada a la reserva');
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
    toast.info('Herramienta eliminada de la reserva');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!professor.trim()) { toast.error('Ingrese el nombre del profesor'); return; }
    if (!date) { toast.error('Seleccione una fecha'); return; }
    if (!timeBlock) { toast.error('Seleccione un bloque horario'); return; }
    if (selectedItems.length === 0) { toast.error('Debe agregar al menos una herramienta'); return; }

    // Marcar herramientas disponibles como "Reservada" y recoger sus IDs
    const reservedToolIds: string[] = [];
    const toolUpdates: { id: string; updates: Partial<typeof tools[0]> }[] = [];

    selectedItems.forEach(item => {
      const available = tools.filter(t => t.type === item.type && t.status === 'Disponible');
      const toReserve = available.slice(0, item.quantity);
      toReserve.forEach(t => {
        reservedToolIds.push(t.id);
        toolUpdates.push({ id: t.id, updates: { status: 'Reservada' } });
      });
    });

    if (toolUpdates.length > 0) {
      batchUpdateTools(toolUpdates);
    }

    const newId = String(Date.now());
    const newReservation: Reservation = {
      id: newId,
      date,
      timeBlock: timeBlock as Reservation['timeBlock'],
      professor: professor.trim(),
      studentCode: studentCode.trim(),
      studentName: studentName.trim(),
      status: 'Confirmada',
      tools: selectedItems.map(t => {
        const avail = availabilityByType.find(a => a.typeName === t.type)?.disponibles ?? 0;
        return { type: t.type, quantity: t.quantity, available: avail };
      }),
      reservedToolIds,
    };

    addReservation(newReservation);

    toast.success('Reserva creada exitosamente', {
      description: `Reserva #${newId} confirmada para ${professor} el día ${date}${reservedToolIds.length > 0 ? ` · ${reservedToolIds.length} herramienta(s) reservada(s) en inventario` : ''}`,
    });
    setTimeout(() => navigate('/dashboard'), 1200);
  };

  const totalAvailable = availabilityByType.reduce((s, a) => s + a.disponibles, 0);
  const hasInventory = tools.length > 0;

  return (
    <div className="space-y-7 max-w-3xl">
      <div className="pb-5 border-b border-stone-200">
        <h1 className="text-[#1a1819]">Crear Reserva</h1>
        <p className="text-stone-500 text-sm mt-1">Planificar el uso de herramientas para una fecha específica</p>
      </div>

      {/* Disponibilidad del inventario */}
      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
            <BarChart2 className="size-4 text-stone-400" />
            Disponibilidad del Inventario
            {hasInventory && (
              <span className="ml-auto text-xs font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                {totalAvailable} disponibles en total
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {!hasInventory ? (
            <p className="text-sm text-stone-400 text-center py-4">
              No hay herramientas registradas en el inventario. Agréguelas desde la sección de Herramientas.
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barSize={18} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e3de" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6e6b64' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6e6b64' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e3de', borderRadius: 4 }} />
                  <Bar dataKey="Disponibles" fill="#2e7d32" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Reservadas" fill="#1d5e8c" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Prestadas" fill="#b07d2a" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {availabilityByType.map(a => (
                  <div key={a.typeName} className="text-center bg-stone-50 border border-stone-200 rounded-sm p-2.5">
                    <p className="text-xs text-stone-500 truncate">{a.name.replace('Herramientas de ', '').replace('Herramientas ', '').replace('Instrumentos de ', 'Med. ')}</p>
                    <p className="text-xl font-light text-emerald-700 mt-0.5">{a.disponibles}</p>
                    <p className="text-xs text-stone-400">de {a.total}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="border-stone-200 shadow-none">
          <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
              <Calendar className="size-4 text-stone-400" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="professor" className="text-xs text-stone-500 uppercase tracking-wide">Profesor Responsable</Label>
                <Input
                  id="professor"
                  placeholder="Nombre del profesor"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  className="border-stone-200 bg-[#f8f7f4] text-sm h-9"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs text-stone-500 uppercase tracking-wide">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-stone-200 bg-[#f8f7f4] text-sm h-9"
                  required
                />
              </div>
            </div>

            {/* Student fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="studentCode" className="text-xs text-stone-500 uppercase tracking-wide">Código del Estudiante</Label>
                <Input
                  id="studentCode"
                  placeholder="Ej. EST-2024-0123"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="border-stone-200 bg-[#f8f7f4] text-sm h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="studentName" className="text-xs text-stone-500 uppercase tracking-wide">Nombre del Estudiante</Label>
                <Input
                  id="studentName"
                  placeholder="Nombre completo del estudiante"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="border-stone-200 bg-[#f8f7f4] text-sm h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timeBlock" className="text-xs text-stone-500 uppercase tracking-wide">Bloque Horario</Label>
              <Select value={timeBlock} onValueChange={(v) => setTimeBlock(v as Reservation['timeBlock'])}>
                <SelectTrigger id="timeBlock" className="border-stone-200 bg-[#f8f7f4] text-sm h-9 text-stone-700">
                  <SelectValue placeholder="Seleccione el bloque horario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Día completo">Día completo</SelectItem>
                  <SelectItem value="Mañana">Mañana (8:00 - 12:00)</SelectItem>
                  <SelectItem value="Tarde">Tarde (13:00 - 17:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-none">
          <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-stone-700">Herramientas Solicitadas</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="toolType" className="text-xs text-stone-500 uppercase tracking-wide">Tipo de Herramienta</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="toolType" className="border-stone-200 bg-[#f8f7f4] text-sm h-9 text-stone-700">
                    <SelectValue placeholder="Seleccione tipo de herramienta" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOOL_TYPES.map((type) => {
                      const avail = availabilityByType.find(a => a.typeName === type.name)?.disponibles ?? 0;
                      return (
                        <SelectItem key={type.name} value={type.name}>
                          {type.label}
                          {hasInventory && (
                            <span className={`ml-2 text-xs ${avail > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              ({avail} disp.)
                            </span>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-xs text-stone-500 uppercase tracking-wide">Cantidad</Label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="flex-1 border-stone-200 bg-[#f8f7f4] text-sm h-9"
                  />
                  <Button
                    type="button"
                    onClick={addItem}
                    className="bg-[#1a2535] hover:bg-[#243347] text-white h-9 px-3"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {selectedItems.length > 0 ? (
              <div className="border border-stone-200 rounded-sm divide-y divide-stone-100">
                {selectedItems.map((item, index) => {
                  const avail = availabilityByType.find(a => a.typeName === item.type)?.disponibles ?? 0;
                  const label = TOOL_TYPES.find(t => t.name === item.type)?.label ?? item.type;
                  return (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-stone-800">{label}</p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Cantidad solicitada: {item.quantity}
                          {hasInventory && (
                            <span className={`ml-2 ${avail >= item.quantity ? 'text-emerald-600' : 'text-amber-600'}`}>
                              · {avail} disponibles en inventario
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                          <CheckCircle className="size-3" />
                          <span>Agregada a la reserva</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-400 text-sm border border-dashed border-stone-300 rounded-sm">
                No se han agregado herramientas a la reserva
              </div>
            )}
          </CardContent>
        </Card>

        {reservations.length > 0 && (
          <div className="p-3.5 border border-stone-200 bg-stone-50 rounded-sm">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1.5">Reservas existentes</p>
            <p className="text-sm text-stone-700">
              Hay <span className="font-medium text-[#1d5e8c]">{reservations.length}</span> reserva{reservations.length !== 1 ? 's' : ''} registrada{reservations.length !== 1 ? 's' : ''} en el sistema.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="bg-[#1a2535] hover:bg-[#243347] text-white">
            <CheckCircle className="size-4 mr-2" />
            Crear Reserva
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="border-stone-200 text-stone-600 hover:bg-stone-50"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
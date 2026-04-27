import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ClipboardList, Calendar, CheckCircle, Info, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';
import { useAppStore } from '../store/AppStore';
import type { Loan } from '../data/mockData';

export function OpenLoan() {
  const navigate = useNavigate();
  const { reservations, tools, addLoan, updateReservation, batchUpdateTools } = useAppStore();

  const [useReservation, setUseReservation] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState('');
  const [professor, setProfessor] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // Solo reservas confirmadas
  const availableReservations = reservations.filter(r => r.status === 'Confirmada');
  const availableTools = tools.filter(t => t.status === 'Disponible');

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (useReservation && !selectedReservation) {
      toast.error('Debe seleccionar una reserva');
      return;
    }

    if (!useReservation && !professor.trim()) {
      toast.error('Ingrese el nombre del profesor');
      return;
    }

    if (!useReservation && selectedTools.length === 0 && availableTools.length > 0) {
      toast.error('Debe seleccionar al menos una herramienta');
      return;
    }

    const newId = String(Date.now());
    const today = new Date().toISOString().split('T')[0];

    let loanProfessor = professor.trim();
    let loanTools: Loan['tools'] = [];
    let reservationId: string | undefined;
    let inventoryToolIds: string[] = [];

    if (useReservation && selectedReservation) {
      const reservation = availableReservations.find(r => r.id === selectedReservation);
      if (!reservation) {
        toast.error('Reserva no encontrada');
        return;
      }
      loanProfessor = reservation.professor;
      reservationId = reservation.id;
      inventoryToolIds = reservation.reservedToolIds || reservation.tools.map(t => t.toolId);

      // Build loan tools directly from specific reserved tools
      loanTools = reservation.tools.map(rt => ({
        toolId: rt.toolId,
        toolName: `${rt.toolName} (${rt.toolCode})`,
        student: '',
        returned: false,
      }));

      // Actualizar herramientas reservadas → Prestada
      if (inventoryToolIds.length > 0) {
        batchUpdateTools(inventoryToolIds.map(id => ({ id, updates: { status: 'Prestada' as const } })));
      }

      // Marcar la reserva como pendiente (en curso)
      updateReservation(reservation.id, { status: 'Pendiente' });
    } else {
      // Préstamo directo sin reserva: usar herramientas seleccionadas del inventario
      loanTools = selectedTools.map(toolId => {
        const tool = availableTools.find(t => t.id === toolId);
        return {
          toolId,
          toolName: tool ? `${tool.name} (${tool.code})` : toolId,
          student: '',
          returned: false,
        };
      });

      inventoryToolIds = selectedTools;

      // Actualizar herramientas seleccionadas → Prestada
      if (selectedTools.length > 0) {
        batchUpdateTools(selectedTools.map(id => ({ id, updates: { status: 'Prestada' as const } })));
      }
    }

    const newLoan: Loan = {
      id: newId,
      reservationId,
      professor: loanProfessor,
      date: today,
      status: 'En curso',
      tools: loanTools,
      inventoryToolIds,
    };

    addLoan(newLoan);

    toast.success('Préstamo abierto exitosamente', {
      description: `Préstamo #${newId} registrado para ${loanProfessor} · ${inventoryToolIds.length} herramienta(s) marcadas como Prestadas`,
    });

    setTimeout(() => navigate(`/loans/${newId}/delivery`), 1200);
  };

  const selectedReservationObj = availableReservations.find(r => r.id === selectedReservation);

  return (
    <div className="space-y-7 max-w-3xl">
      <div className="pb-5 border-b border-stone-200">
        <h1 className="text-[#1a1819]">Abrir Préstamo</h1>
        <p className="text-stone-500 text-sm mt-1">Iniciar un nuevo préstamo de herramientas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="border-stone-200 shadow-none">
          <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
              <ClipboardList className="size-4 text-stone-400" />
              Información del Préstamo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3 p-3.5 border border-stone-200 rounded-sm bg-stone-50">
              <Checkbox
                id="useReservation"
                checked={useReservation}
                onCheckedChange={(checked) => {
                  setUseReservation(checked as boolean);
                  setSelectedReservation('');
                  setProfessor('');
                  setSelectedTools([]);
                }}
              />
              <label htmlFor="useReservation" className="text-sm text-stone-700 cursor-pointer">
                Abrir desde una reserva existente
                {availableReservations.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#1d5e8c]/10 text-[#1d5e8c] rounded-sm font-medium">
                    {availableReservations.length} disponible{availableReservations.length !== 1 ? 's' : ''}
                  </span>
                )}
              </label>
            </div>

            {useReservation ? (
              <div className="space-y-3">
                {availableReservations.length === 0 ? (
                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-sm">
                    <p className="text-sm text-amber-800">
                      No hay reservas confirmadas disponibles. Cree una reserva primero desde el menú lateral.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="reservation" className="text-xs text-stone-500 uppercase tracking-wide">Seleccionar Reserva</Label>
                      <Select value={selectedReservation} onValueChange={setSelectedReservation}>
                        <SelectTrigger id="reservation" className="border-stone-200 bg-[#f8f7f4] text-sm h-9 text-stone-700">
                          <SelectValue placeholder="Seleccione una reserva confirmada" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableReservations.map((reservation) => (
                            <SelectItem key={reservation.id} value={reservation.id}>
                              #{reservation.id.slice(-6)} — {reservation.professor} — {reservation.date} ({reservation.timeBlock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedReservationObj && (
                      <div className="p-4 border border-[#1d5e8c]/20 bg-[#1d5e8c]/5 rounded-sm">
                        <div className="flex items-center gap-2 mb-2.5">
                          <Calendar className="size-3.5 text-[#1d5e8c]" />
                          <span className="text-xs font-medium text-[#1d5e8c] uppercase tracking-wide">Detalles de la Reserva</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-stone-700">
                            Profesor: <span className="font-medium">{selectedReservationObj.professor}</span>
                          </p>
                          <p className="text-sm text-stone-700">
                            Fecha: <span className="font-medium">{selectedReservationObj.date}</span> · {selectedReservationObj.timeBlock}
                          </p>
                          <div className="mt-2.5 pt-2.5 border-t border-stone-200">
                            <p className="text-xs font-medium text-stone-600 mb-1.5">Herramientas reservadas:</p>
                            {selectedReservationObj.tools.map((tool, idx) => (
                              <p key={idx} className="text-xs text-stone-600 flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-stone-400 rounded-full shrink-0"></span>
                                <span className="font-mono text-[#1d5e8c]">{tool.toolCode}</span>
                                <span>— {tool.toolName}</span>
                              </p>
                            ))}
                            {selectedReservationObj.reservedToolIds && selectedReservationObj.reservedToolIds.length > 0 && (
                              <p className="text-xs text-emerald-600 mt-1.5">
                                {selectedReservationObj.reservedToolIds.length} herramienta(s) confirmadas en inventario
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="professor" className="text-xs text-stone-500 uppercase tracking-wide">Profesor Responsable</Label>
                  <Input
                    id="professor"
                    placeholder="Nombre del profesor"
                    value={professor}
                    onChange={(e) => setProfessor(e.target.value)}
                    className="border-stone-200 bg-[#f8f7f4] text-sm h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-stone-500 uppercase tracking-wide">
                    Herramientas Disponibles ({selectedTools.length} seleccionadas)
                  </Label>
                  {availableTools.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-stone-300 rounded-sm">
                      <Package className="size-6 text-stone-300 mx-auto mb-2" />
                      <p className="text-sm text-stone-400">No hay herramientas disponibles en el inventario</p>
                      <p className="text-xs text-stone-400 mt-1">Agregue herramientas desde el Inventario o libere algunas</p>
                    </div>
                  ) : (
                    <div className="border border-stone-200 rounded-sm divide-y divide-stone-100 max-h-80 overflow-y-auto">
                      {availableTools.map((tool) => (
                        <div
                          key={tool.id}
                          className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                            selectedTools.includes(tool.id) ? 'bg-[#1d5e8c]/5' : 'hover:bg-stone-50'
                          }`}
                          onClick={() => toggleTool(tool.id)}
                        >
                          <Checkbox
                            id={`tool-${tool.id}`}
                            checked={selectedTools.includes(tool.id)}
                            onCheckedChange={() => toggleTool(tool.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label htmlFor={`tool-${tool.id}`} className="flex-1 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                            <p className="text-sm font-medium text-stone-800">{tool.name}</p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {tool.code} · {tool.type} · {tool.location}
                            </p>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-start gap-3 p-4 border border-amber-200 bg-amber-50 rounded-sm">
          <Info className="size-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <span className="font-medium">Importante:</span> Al abrir un préstamo, las herramientas cambiarán su estado a "Prestada" en el inventario.
            Recuerde registrar la entrega de cada herramienta a los estudiantes correspondientes.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="bg-[#1a2535] hover:bg-[#243347] text-white">
            <CheckCircle className="size-4 mr-2" />
            Abrir Préstamo
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
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PackageCheck, CheckCircle, AlertTriangle, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from './ui/dialog';
import { useAppStore } from '../store/AppStore';
import type { Incident, Tool } from '../data/mockData';

export function ToolReturn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loans, updateLoan, addIncident, batchUpdateTools } = useAppStore();
  const loan = loans.find(l => l.id === id);

  const [returns, setReturns] = useState<{
    [key: string]: { state: 'OK' | 'Incidencia'; type?: string; description?: string }
  }>({});
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [incidentType, setIncidentType] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');

  if (!loan) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-400 text-sm">Préstamo no encontrado</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4 bg-[#1a2535] hover:bg-[#243347] text-white">
          Volver al Panel
        </Button>
      </div>
    );
  }

  const handleReturnOK = (toolId: string) => {
    setReturns(prev => ({ ...prev, [toolId]: { state: 'OK' } }));
    toast.success('Herramienta marcada como OK');
  };

  const handleReportIncident = () => {
    if (!currentTool || !incidentType || !incidentDescription) {
      toast.error('Complete todos los campos de la incidencia');
      return;
    }

    const toolInfo = loan?.tools.find(t => t.toolId === currentTool);

    const newIncident: Incident = {
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      tool: toolInfo?.toolName || currentTool,
      student: toolInfo?.student || 'Sin asignar',
      type: incidentType as Incident['type'],
      description: incidentDescription,
      status: 'Pendiente',
    };

    addIncident(newIncident);

    setReturns(prev => ({
      ...prev,
      [currentTool]: { state: 'Incidencia', type: incidentType, description: incidentDescription }
    }));
    toast.warning('Incidencia registrada', {
      description: 'La herramienta ha sido marcada con incidencia',
    });
    setCurrentTool(null);
    setIncidentType('');
    setIncidentDescription('');
  };

  const handleCompleteReturn = () => {
    if (!loan) return;
    const unreturned = loan.tools.filter(t => !t.returned && !returns[t.toolId]);
    if (unreturned.length > 0) {
      toast.error('No se puede completar', {
        description: 'Hay herramientas pendientes de verificación',
      });
      return;
    }

    // Actualizar herramientas del préstamo como devueltas
    const updatedTools = loan.tools.map(t => ({
      ...t,
      returned: true,
      state: returns[t.toolId]?.state ?? t.state ?? 'OK',
    }));
    updateLoan(loan.id, { tools: updatedTools as typeof loan.tools });

    // Actualizar estados en el inventario real
    const inventoryIds = loan.inventoryToolIds || [];
    if (inventoryIds.length > 0) {
      // Determinar el nuevo estado por herramienta según índice posicional
      const toolUpdates: { id: string; updates: Partial<Tool> }[] = inventoryIds.map((inventoryId, idx) => {
        const loanTool = loan.tools[idx];
        if (!loanTool) return { id: inventoryId, updates: { status: 'Disponible' as const } };

        const returnState = returns[loanTool.toolId] ?? (loanTool.returned ? { state: 'OK', type: undefined } : null);
        let newStatus: Tool['status'] = 'Disponible';

        if (returnState?.state === 'Incidencia') {
          if (returnState.type === 'Pérdida') {
            newStatus = 'Baja';
          } else if (returnState.type === 'Daño') {
            newStatus = 'En reparación';
          } else {
            newStatus = 'Disponible'; // Observación → sigue disponible
          }
        }

        return { id: inventoryId, updates: { status: newStatus } };
      });

      batchUpdateTools(toolUpdates);
    }

    toast.success('Devolución completada', {
      description: 'Todas las herramientas han sido verificadas y el inventario actualizado',
    });
    setTimeout(() => navigate(`/loans/${id}/liquidate`), 1500);
  };

  const totalReturned = loan.tools.filter(t => t.returned).length;
  const verifiedNow = Object.keys(returns).length;
  const pending = loan.tools.filter(t => !t.returned && !returns[t.toolId]).length;

  return (
    <div className="space-y-7 max-w-3xl">
      <div className="pb-5 border-b border-stone-200">
        <h1 className="text-[#1a1819]">Devolución y Verificación</h1>
        <p className="text-stone-500 text-sm mt-1">Préstamo #{loan.id} · {loan.professor}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-stone-200 rounded-sm p-4 text-center">
          <p className="text-2xl font-light text-stone-800">{loan.tools.length}</p>
          <p className="text-xs text-stone-500 mt-0.5">Total</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-sm p-4 text-center">
          <p className="text-2xl font-light text-emerald-700">{totalReturned + verifiedNow}</p>
          <p className="text-xs text-stone-500 mt-0.5">Verificadas</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-sm p-4 text-center">
          <p className="text-2xl font-light text-amber-700">{pending}</p>
          <p className="text-xs text-stone-500 mt-0.5">Pendientes</p>
        </div>
      </div>

      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
            <PackageCheck className="size-4 text-stone-400" />
            Verificar Herramientas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {loan.tools.map((tool) => {
            const returnState = returns[tool.toolId];
            const isReturned = tool.returned || !!returnState;

            return (
              <div key={tool.toolId} className="border border-stone-200 rounded-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-800">{tool.toolName}</p>
                    <p className="text-xs text-stone-500 mt-0.5">Estudiante: {tool.student || 'Sin asignar'}</p>

                    {tool.returned && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <CheckCircle className="size-3.5 text-emerald-600" />
                        <span className="text-xs text-emerald-600">Devuelta — Estado: {tool.state}</span>
                      </div>
                    )}

                    {returnState && (
                      <div className="mt-2">
                        {returnState.state === 'OK' ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="size-3.5 text-emerald-600" />
                            <span className="text-xs text-emerald-600">Verificada — Estado: OK · Volverá a Disponible</span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="size-3.5 text-red-600" />
                              <span className="text-xs text-red-600">
                                Incidencia: {returnState.type}
                                {returnState.type === 'Pérdida' && ' → Baja del inventario'}
                                {returnState.type === 'Daño' && ' → En reparación'}
                                {returnState.type === 'Observación' && ' → Disponible con observación'}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 ml-5">{returnState.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isReturned && (
                    <span className="px-2 py-0.5 text-xs rounded-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 ml-3">
                      Devuelta
                    </span>
                  )}
                </div>

                {!isReturned && (
                  <div className="flex gap-2 pt-3 border-t border-stone-100">
                    <Button
                      onClick={() => handleReturnOK(tool.toolId)}
                      variant="outline"
                      className="flex-1 border-stone-200 text-stone-600 hover:bg-stone-50 text-xs h-8"
                    >
                      <CheckCircle className="size-3.5 mr-1.5" />
                      Marcar OK
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setCurrentTool(tool.toolId)}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs h-8"
                        >
                          <AlertTriangle className="size-3.5 mr-1.5" />
                          Incidencia
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border-stone-200">
                        <DialogHeader>
                          <DialogTitle className="text-[#1a1819]">Reportar Incidencia</DialogTitle>
                          <DialogDescription className="text-stone-500 text-sm">
                            Registre el problema encontrado en la herramienta
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-stone-500 uppercase tracking-wide">Tipo de Incidencia</Label>
                            <Select value={incidentType} onValueChange={setIncidentType}>
                              <SelectTrigger className="border-stone-200 bg-[#f8f7f4] text-sm h-9 text-stone-700">
                                <SelectValue placeholder="Seleccione el tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Daño">Daño → En reparación</SelectItem>
                                <SelectItem value="Pérdida">Pérdida → Baja del inventario</SelectItem>
                                <SelectItem value="Observación">Observación → Disponible</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-stone-500 uppercase tracking-wide">Descripción</Label>
                            <Textarea
                              placeholder="Describa el problema encontrado..."
                              value={incidentDescription}
                              onChange={(e) => setIncidentDescription(e.target.value)}
                              rows={4}
                              className="border-stone-200 bg-[#f8f7f4] text-sm resize-none"
                            />
                          </div>
                          <div className="flex items-start gap-2.5 p-3 border border-amber-200 bg-amber-50 rounded-sm">
                            <Info className="size-3.5 text-amber-700 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-800">
                              El estado de la herramienta en el inventario se actualizará automáticamente según el tipo de incidencia.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleReportIncident}
                              className="flex-1 bg-[#1a2535] hover:bg-[#243347] text-white text-sm"
                            >
                              Registrar Incidencia
                            </Button>
                            <Button
                              variant="outline"
                              className="border-stone-200 text-stone-600 hover:bg-stone-50"
                              onClick={() => {
                                setCurrentTool(null);
                                setIncidentType('');
                                setIncidentDescription('');
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 border border-amber-200 bg-amber-50 rounded-sm">
        <Info className="size-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <span className="font-medium">Importante:</span> Al completar la devolución, el inventario se actualizará automáticamente:
          herramientas OK vuelven a "Disponible", daños pasan a "En reparación" y pérdidas a "Baja".
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleCompleteReturn}
          className="bg-[#1a2535] hover:bg-[#243347] text-white"
        >
          <CheckCircle className="size-4 mr-2" />
          Completar Devolución
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="border-stone-200 text-stone-600 hover:bg-stone-50"
        >
          Volver al Panel
        </Button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Package, User, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/AppStore';

export function ToolDelivery() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loans, updateLoan } = useAppStore();
  const loan = loans.find(l => l.id === id);

  const [deliveries, setDeliveries] = useState<{ [key: string]: string }>({});
  const [delivered, setDelivered] = useState<Set<string>>(new Set());

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

  const handleStudentChange = (toolId: string, student: string) => {
    setDeliveries(prev => ({ ...prev, [toolId]: student }));
  };

  const handleDeliver = (toolId: string) => {
    const student = deliveries[toolId];
    if (!student || student.trim() === '') {
      toast.error('Debe ingresar el nombre del estudiante');
      return;
    }
    setDelivered(prev => new Set([...prev, toolId]));
    toast.success('Herramienta entregada', {
      description: `Entregada a ${student}`,
    });
  };

  const handleCompleteDelivery = () => {
    if (!loan) return;

    // Actualizar las herramientas del préstamo con los estudiantes asignados
    const updatedTools = loan.tools.map(t => ({
      ...t,
      student: deliveries[t.toolId]?.trim() || t.student,
    }));

    updateLoan(loan.id, { tools: updatedTools, status: 'En curso' });

    const pendingCount = loan.tools.filter(t => !delivered.has(t.toolId) && !t.student).length;
    if (pendingCount > 0) {
      toast.warning('Hay herramientas sin asignar', {
        description: 'Puede continuar y asignarlas más tarde',
      });
    } else {
      toast.success('Todas las herramientas han sido entregadas');
    }
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div className="space-y-7 max-w-3xl">
      <div className="pb-5 border-b border-stone-200">
        <h1 className="text-[#1a1819]">Entrega de Herramientas</h1>
        <p className="text-stone-500 text-sm mt-1">Préstamo #{loan.id} · {loan.professor}</p>
      </div>

      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
            <Package className="size-4 text-stone-400" />
            Información del Préstamo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <dl className="grid grid-cols-2 gap-y-3">
            <dt className="text-xs text-stone-500 uppercase tracking-wide">Profesor</dt>
            <dd className="text-sm text-stone-800 font-medium">{loan.professor}</dd>
            <dt className="text-xs text-stone-500 uppercase tracking-wide">Fecha</dt>
            <dd className="text-sm text-stone-800 font-medium">{loan.date}</dd>
            <dt className="text-xs text-stone-500 uppercase tracking-wide">Estado</dt>
            <dd>
              <span className="px-2 py-0.5 text-xs rounded-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {loan.status}
              </span>
            </dd>
          </dl>
        </CardContent>
      </Card>

      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-medium text-stone-700">Asignar Herramientas a Estudiantes</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {loan.tools.map((tool) => (
            <div key={tool.toolId} className="border border-stone-200 rounded-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-stone-800">{tool.toolName}</p>
                  {tool.student ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle className="size-3.5 text-emerald-600" />
                      <p className="text-xs text-emerald-600">Entregado a: {tool.student}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-1">
                      <AlertCircle className="size-3.5 text-amber-600" />
                      <p className="text-xs text-amber-600">Pendiente de entrega</p>
                    </div>
                  )}
                </div>
              </div>

              {!tool.student && (
                <div className="space-y-1.5">
                  <Label htmlFor={`student-${tool.toolId}`} className="text-xs text-stone-500 uppercase tracking-wide">
                    Nombre del Estudiante
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
                      <Input
                        id={`student-${tool.toolId}`}
                        placeholder="Ingrese nombre del estudiante"
                        value={deliveries[tool.toolId] || ''}
                        onChange={(e) => handleStudentChange(tool.toolId, e.target.value)}
                        className="pl-9 border-stone-200 bg-[#f8f7f4] text-sm h-9"
                      />
                    </div>
                    <Button
                      onClick={() => handleDeliver(tool.toolId)}
                      disabled={!deliveries[tool.toolId]}
                      className="bg-[#1a2535] hover:bg-[#243347] text-white h-9"
                    >
                      <CheckCircle className="size-3.5 mr-1.5" />
                      Entregar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 border border-[#1d5e8c]/20 bg-[#1d5e8c]/5 rounded-sm">
        <Info className="size-4 text-[#1d5e8c] shrink-0 mt-0.5" />
        <p className="text-xs text-[#1d5e8c]/80">
          <span className="font-medium">Importante:</span> Cada herramienta debe quedar asignada a un estudiante específico.
          Esta información es necesaria para el proceso de devolución y trazabilidad.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleCompleteDelivery}
          className="bg-[#1a2535] hover:bg-[#243347] text-white"
        >
          <CheckCircle className="size-4 mr-2" />
          Finalizar Entrega
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
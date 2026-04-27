import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileCheck, CheckCircle, AlertCircle, XCircle, Info, History } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';
import { useAppStore } from '../store/AppStore';
import type { LoanHistory } from '../data/mockData';

export function LoanLiquidation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loans, reservations, updateLoan, removeLoan, removeReservation, addToHistory } = useAppStore();
  const loan = loans.find(l => l.id === id);

  // Retrieve associated reservation for student info
  const reservation = loan?.reservationId
    ? reservations.find(r => r.id === loan.reservationId)
    : undefined;

  const [confirmChecks, setConfirmChecks] = useState({
    allReturned: false,
    allVerified: false,
    noIncidents: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const allToolsReturned = loan.tools.every(t => t.returned);
  const pendingTools = loan.tools.filter(t => !t.returned);
  const toolsWithIncidents = loan.tools.filter(t => t.state === 'Incidencia');

  const canLiquidate = allToolsReturned && confirmChecks.allReturned && confirmChecks.allVerified;

  const handleLiquidate = () => {
    // Prevent double-execution (double-click or stale closure re-trigger)
    if (isSubmitting) return;
    if (!canLiquidate) {
      toast.error('No se puede liquidar el préstamo', {
        description: 'Debe completar todas las validaciones requeridas',
      });
      return;
    }

    setIsSubmitting(true);

    const today = new Date().toISOString().split('T')[0];

    // Build history record before removing
    const historyRecord: LoanHistory = {
      id: String(Date.now()),
      loanId: loan.id,
      reservationId: loan.reservationId,
      professor: loan.professor,
      studentCode: reservation?.studentCode || loan.studentCode,
      studentName: reservation?.studentName || loan.studentName,
      startDate: loan.date,
      endDate: today,
      tools: loan.tools,
      incidentsCount: toolsWithIncidents.length,
    };

    // Add to history
    addToHistory(historyRecord);

    // Remove loan and associated reservation
    removeLoan(loan.id);
    if (loan.reservationId) {
      removeReservation(loan.reservationId);
    }

    toast.success('Préstamo liquidado y archivado', {
      description: 'El préstamo se ha movido al historial y las herramientas están disponibles.',
    });
    setTimeout(() => navigate('/history'), 1800);
  };

  return (
    <div className="space-y-7 max-w-3xl">
      <div className="pb-5 border-b border-stone-200">
        <h1 className="text-[#1a1819]">Liquidación del Préstamo</h1>
        <p className="text-stone-500 text-sm mt-1">Préstamo #{loan.id} · {loan.professor}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-stone-200 rounded-sm p-4 text-center">
          <p className="text-2xl font-light text-stone-800">{loan.tools.length}</p>
          <p className="text-xs text-stone-500 mt-0.5">Total herramientas</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-sm p-4 text-center">
          <p className="text-2xl font-light text-emerald-700">{loan.tools.filter(t => t.returned).length}</p>
          <p className="text-xs text-stone-500 mt-0.5">Devueltas</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-sm p-4 text-center">
          <p className="text-2xl font-light text-red-700">{toolsWithIncidents.length}</p>
          <p className="text-xs text-stone-500 mt-0.5">Con incidencias</p>
        </div>
      </div>

      {/* Student info from reservation */}
      {(reservation?.studentName || reservation?.studentCode) && (
        <div className="p-4 border border-[#1d5e8c]/20 bg-[#1d5e8c]/5 rounded-sm">
          <p className="text-xs font-medium text-[#1d5e8c] uppercase tracking-wide mb-2">Estudiante Responsable</p>
          <div className="flex items-center gap-6">
            {reservation.studentName && (
              <div>
                <p className="text-xs text-stone-500">Nombre</p>
                <p className="text-sm font-medium text-stone-800">{reservation.studentName}</p>
              </div>
            )}
            {reservation.studentCode && (
              <div>
                <p className="text-xs text-stone-500">Código</p>
                <p className="text-sm font-mono font-medium text-stone-800">{reservation.studentCode}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validación */}
      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
            <FileCheck className="size-4 text-stone-400" />
            Validación de Estado
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {allToolsReturned ? (
            <div className="flex items-start gap-3 p-4 border border-emerald-200 bg-emerald-50 rounded-sm">
              <CheckCircle className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-900">Todas las herramientas han sido devueltas</p>
                <p className="text-xs text-emerald-700 mt-0.5">No hay herramientas pendientes de devolución</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 border border-red-200 bg-red-50 rounded-sm">
                <XCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">No se puede liquidar: hay herramientas pendientes</p>
                  <p className="text-xs text-red-700 mt-0.5">
                    {pendingTools.length} herramienta(s) sin devolución o estado definido
                  </p>
                </div>
              </div>

              <div className="border border-stone-200 rounded-sm divide-y divide-stone-100">
                {pendingTools.map((tool) => (
                  <div key={tool.toolId} className="p-3.5">
                    <p className="text-sm font-medium text-stone-800">{tool.toolName}</p>
                    <p className="text-xs text-stone-500 mt-0.5">Asignada a: {tool.student || 'Sin asignar'}</p>
                    <p className="text-xs text-amber-600 mt-0.5">Pendiente de devolución</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {toolsWithIncidents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 border border-amber-200 bg-amber-50 rounded-sm">
                <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Herramientas con incidencias registradas</p>
                  <p className="text-xs text-amber-700 mt-0.5">Estas herramientas requieren seguimiento posterior</p>
                </div>
              </div>

              <div className="border border-stone-200 rounded-sm divide-y divide-stone-100">
                {toolsWithIncidents.map((tool) => (
                  <div key={tool.toolId} className="p-3.5">
                    <p className="text-sm font-medium text-stone-800">{tool.toolName}</p>
                    <p className="text-xs text-stone-500 mt-0.5">Estudiante: {tool.student}</p>
                    <p className="text-xs text-red-600 mt-0.5">Incidencia registrada</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-medium text-stone-700">Confirmación de Liquidación</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-2.5">
          <div className="flex items-start gap-3 p-3.5 border border-stone-200 rounded-sm bg-stone-50">
            <Checkbox
              id="allReturned"
              checked={confirmChecks.allReturned}
              onCheckedChange={(checked) =>
                setConfirmChecks(prev => ({ ...prev, allReturned: checked as boolean }))
              }
              disabled={!allToolsReturned}
            />
            <label
              htmlFor="allReturned"
              className={`text-sm cursor-pointer flex-1 ${!allToolsReturned ? 'opacity-40' : 'text-stone-700'}`}
            >
              Confirmo que todas las herramientas han sido devueltas
            </label>
          </div>

          <div className="flex items-start gap-3 p-3.5 border border-stone-200 rounded-sm bg-stone-50">
            <Checkbox
              id="allVerified"
              checked={confirmChecks.allVerified}
              onCheckedChange={(checked) =>
                setConfirmChecks(prev => ({ ...prev, allVerified: checked as boolean }))
              }
              disabled={!allToolsReturned}
            />
            <label
              htmlFor="allVerified"
              className={`text-sm cursor-pointer flex-1 ${!allToolsReturned ? 'opacity-40' : 'text-stone-700'}`}
            >
              Confirmo que el estado de todas las herramientas ha sido verificado
            </label>
          </div>

          <div className="flex items-start gap-3 p-3.5 border border-stone-200 rounded-sm bg-stone-50">
            <Checkbox
              id="noIncidents"
              checked={confirmChecks.noIncidents}
              onCheckedChange={(checked) =>
                setConfirmChecks(prev => ({ ...prev, noIncidents: checked as boolean }))
              }
            />
            <label htmlFor="noIncidents" className="text-sm text-stone-700 cursor-pointer flex-1">
              Acepto que las incidencias registradas han sido documentadas correctamente
            </label>
          </div>

          {!allToolsReturned && (
            <div className="flex items-start gap-2.5 p-3.5 border border-red-200 bg-red-50 rounded-sm mt-1">
              <Info className="size-3.5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">
                <span className="font-medium">No se puede liquidar:</span> Debe completar la devolución de todas las herramientas antes de liquidar el préstamo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Archive info */}
      <div className="flex items-start gap-3 p-4 border border-stone-200 bg-stone-50 rounded-sm">
        <History className="size-4 text-stone-500 shrink-0 mt-0.5" />
        <p className="text-xs text-stone-600">
          <span className="font-medium">Al liquidar:</span> El préstamo y su reserva asociada se eliminarán de los registros activos y se archivarán en el Historial de Préstamos para consulta futura.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleLiquidate}
          disabled={!canLiquidate || isSubmitting}
          className="bg-[#1a2535] hover:bg-[#243347] text-white disabled:opacity-40"
        >
          <CheckCircle className="size-4 mr-2" />
          {isSubmitting ? 'Liquidando…' : 'Confirmar Liquidación'}
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
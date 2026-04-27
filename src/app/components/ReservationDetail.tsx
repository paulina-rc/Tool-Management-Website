import { useParams, useNavigate, Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar, User, Clock, Package, ArrowLeft, ArrowRight, Edit, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/AppStore';

export function ReservationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reservations, updateReservation, removeReservation, batchUpdateTools, userRole, userName } = useAppStore();
  const reservation = reservations.find(r => r.id === id);

  const isAdmin = userRole === 'admin';
  const backPath = isAdmin ? '/reservations' : '/my-reservations';
  const backLabel = isAdmin ? 'Volver a Gestión de Reservas' : 'Volver a Mis Reservas';

  if (!reservation) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-400 text-sm">Reserva no encontrada</p>
        <Button onClick={() => navigate(backPath)} className="mt-4 bg-[#1a2535] hover:bg-[#243347] text-white">
          {backLabel}
        </Button>
      </div>
    );
  }

  // Professors can only access their own reservations
  if (!isAdmin && reservation.professor !== userName) {
    navigate(backPath, { replace: true });
    return null;
  }

  const canEdit = isAdmin || reservation.professor === userName;

  const handleCancel = () => {
    // Release reserved tools back to available
    if (reservation.reservedToolIds?.length) {
      batchUpdateTools(reservation.reservedToolIds.map(toolId => ({
        id: toolId,
        updates: { status: 'Disponible' as const },
      })));
    }
    updateReservation(id!, { status: 'Cancelada' });
    toast.success('Reserva cancelada', {
      description: 'La reserva ha sido cancelada y las herramientas están disponibles nuevamente',
    });
    setTimeout(() => navigate(backPath), 1500);
  };

  const handleDelete = () => {
    if (reservation.reservedToolIds?.length) {
      batchUpdateTools(reservation.reservedToolIds.map(toolId => ({
        id: toolId,
        updates: { status: 'Disponible' as const },
      })));
    }
    removeReservation(id!);
    toast.success('Reserva eliminada');
    navigate(backPath);
  };

  const handleOpenLoan = () => {
    toast.success('Abriendo préstamo desde reserva');
    setTimeout(() => navigate('/loans/open'), 1000);
  };

  const statusStyle =
    reservation.status === 'Confirmada'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : reservation.status === 'Pendiente'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : 'bg-red-50 text-red-700 border border-red-200';

  return (
    <div className="space-y-7 max-w-3xl">
      <div className="pb-5 border-b border-stone-200 flex items-start justify-between">
        <div>
          <h1 className="text-[#1a1819]">Detalle de Reserva</h1>
          <p className="text-stone-500 text-sm mt-1">Reserva #{reservation.id}</p>
        </div>
        <span className={`px-2.5 py-1 text-xs rounded-sm font-medium shrink-0 mt-1 ${statusStyle}`}>
          {reservation.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border-stone-200 shadow-none">
          <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
              <Calendar className="size-4 text-stone-400" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <User className="size-4 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-stone-500">Profesor Responsable</p>
                <p className="text-sm font-medium text-stone-800 mt-0.5">{reservation.professor}</p>
              </div>
            </div>
            {(reservation.studentName || reservation.studentCode) && (
              <div className="flex items-start gap-3">
                <User className="size-4 text-[#1d5e8c] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-stone-500">Estudiante</p>
                  <p className="text-sm font-medium text-stone-800 mt-0.5">{reservation.studentName || '—'}</p>
                  {reservation.studentCode && (
                    <p className="text-xs font-mono text-stone-500 mt-0.5 bg-stone-100 inline-block px-1.5 py-0.5 rounded-sm">
                      {reservation.studentCode}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Calendar className="size-4 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-stone-500">Fecha</p>
                <p className="text-sm font-medium text-stone-800 mt-0.5">
                  {new Date(reservation.date + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="size-4 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-stone-500">Bloque Horario</p>
                <p className="text-sm font-medium text-stone-800 mt-0.5">{reservation.timeBlock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-none">
          <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
              <Package className="size-4 text-stone-400" />
              Herramientas Solicitadas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-2.5">
            {reservation.tools.map((tool) => (
              <div key={tool.toolId} className="border border-stone-200 rounded-sm p-3.5 flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-[#1d5e8c]/8 shrink-0 mt-0.5">
                  <Package className="size-4 text-[#1d5e8c]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-mono font-medium text-[#1d5e8c] bg-[#1d5e8c]/8 px-1.5 py-0.5 rounded-sm">
                      {tool.toolCode}
                    </span>
                    <span className="text-sm font-medium text-stone-800 truncate">{tool.toolName}</span>
                  </div>
                  <p className="text-xs text-stone-500">{tool.toolType}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-stone-200 shadow-none">
        <CardHeader className="border-b border-stone-100 pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-medium text-stone-700">Acciones</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-2.5">
            {/* Admin-only: open loan */}
            {isAdmin && reservation.status !== 'Cancelada' && (
              <Button
                onClick={handleOpenLoan}
                className="bg-[#1a2535] hover:bg-[#243347] text-white text-sm"
              >
                <ArrowRight className="size-4 mr-2" />
                Abrir Préstamo
              </Button>
            )}

            {/* Cancel (shared, only if not already cancelled) */}
            {canEdit && reservation.status !== 'Cancelada' && (
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-amber-200 text-amber-700 hover:bg-amber-50 text-sm"
              >
                <Trash2 className="size-4 mr-2" />
                Cancelar Reserva
              </Button>
            )}

            {/* Delete (shared) */}
            {canEdit && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-red-200 text-red-600 hover:bg-red-50 text-sm"
              >
                <Trash2 className="size-4 mr-2" />
                Eliminar Reserva
              </Button>
            )}

            {/* Back */}
            <Link to={backPath}>
              <Button
                variant="ghost"
                className="text-stone-500 hover:text-stone-700 hover:bg-stone-100 text-sm"
              >
                <ArrowLeft className="size-4 mr-2" />
                {backLabel}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2.5 p-4 border border-[#1d5e8c]/20 bg-[#1d5e8c]/5 rounded-sm">
        <Info className="size-4 text-[#1d5e8c] shrink-0 mt-0.5" />
        <p className="text-xs text-[#1d5e8c]/80">
          <span className="font-medium">Nota:</span> La reserva garantiza disponibilidad planificada, pero el préstamo final puede variar en cantidad según disponibilidad al momento de formalizar.
        </p>
      </div>
    </div>
  );
}
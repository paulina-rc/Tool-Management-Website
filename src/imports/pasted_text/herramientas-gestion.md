Tu prototipo debe incluir como mínimo estas pantallas:
1. Inicio de sesión
2. Dashboard (resumen rápido: reservas del día, préstamos abiertos, incidencias
recientes)
3. Listado de herramientas (tabla + búsqueda + filtros por tipo/estado)
4. Crear reserva (fecha + bloque + herramienta por tipo/cantidad)
5. Detalle de reserva (ver, editar/cancelar, estado)
6. Abrir préstamo (desde reserva o manual)
7. Entrega de herramientas (asignar herramienta a estudiante dentro del
préstamo)
8. Devolución y verificación (marcar OK o reportar incidencia)
9. Liquidación del préstamo (validación de pendientes + confirmar cierre)
10. Reportes (al menos 2 reportes con filtros)
C. Flujo prototipado (obligatorio)
Debe existir un prototipo navegable con este recorrido mínimo:
 Dashboard → Crear reserva → Detalle de reserva → Abrir préstamo → Entrega a
estudiante → Devolución (OK o incidencia) → Liquidar préstamo → Reporte
 Incluí confirmaciones y mensajes clave (por ejemplo: “Reserva creada”, “No
hay disponibilidad”, “No se puede liquidar: hay herramientas pendientes”).
D. Reglas de negocio reflejadas en la UI (sin programar)
Aunque no se programe, tu diseño debe hacer visibles estas reglas mediante la
interfaz:
 El bloque horario debe ser: Día completo / Mañana / Tarde.
 Al reservar, debe existir una forma de ver disponibilidad (por ejemplo:
“Disponibles: 12 / Solicitadas: 8”).
 Una reserva bloquea cantidades, pero el préstamo puede ajustar
cantidades/variedad al formalizar.
 No se permite liquidar un préstamo si hay herramientas sin devolución/estado
definido.
 En devolución: marcar OK o registrar Incidencia (tipo + descripción; opcional:
evidencia/foto como marcador UI).
Sistema de Préstamo y Reserva de Herramientas.
1. Nombre del proyecto
Sistema de Reserva, Préstamo, Devolución y Control de Herramientas.
2. Contexto y problema a resolver
En instituciones educativas, el trabajo de aula o campo requiere el uso frecuente de
herramientas. Estas herramientas suelen administrarse mediante controles manuales o
registros informales, lo que provoca problemas recurrentes:
 Falta de control real sobre la disponibilidad de herramientas por fecha.
 Reservas no estructuradas que generan conflictos entre profesores.
 Pérdida de herramientas o devolución en mal estado sin trazabilidad.
 Dificultad para asignar responsabilidad por herramienta y estudiante.
 Ausencia de reportes confiables para auditoría, mantenimiento y compras.
Este proyecto propone un sistema que permita planificar (reservar), controlar (prestar y
devolver) y auditar (reportar) el uso de herramientas, asegurando trazabilidad completa y
mejor administración del inventario.
3. Objetivo general
Desarrollar e implementar un sistema informático que permita gestionar de forma integral el
ciclo de vida de las herramientas: reserva, préstamo, entrega, devolución, verificación de
estado y liquidación, con control de disponibilidad por fecha y bloque horario, y generación
de reportes.
4. Objetivos específicos
 Permitir que el profesor encargado realice reservas para fechas específicas, por día
completo o medio día (mañana/tarde).
 Verificar la disponibilidad real de herramientas y bloquear cantidades según
solicitudes de reserva.
 Permitir abrir un préstamo asociado a un profesor (y opcionalmente basado en una
reserva).
 Registrar el retiro de herramientas por estudiantes, asegurando que cada herramienta
quede vinculada a:
o un estudiante,
o un préstamo,
o y un profesor responsable.
 Gestionar devoluciones, permitiendo marcar herramientas como OK o reportar
incidencias (daño, pérdida, observación).
 Liquidar préstamos cuando la jornada de trabajo finaliza y todas las herramientas
fueron devueltas o registradas con su estado correspondiente.
 Proveer un módulo de reportes para análisis, auditoría, mantenimiento y toma de
decisiones.
5. Alcance del sistema
El sistema abarcará:
5.1 Gestión de inventario
 Registro y mantenimiento de:
o Tipos de herramientas.
o Herramientas individuales (con código/identificador).
o Estados de herramienta (disponible, reservada, prestada, en reparación,
baja).
o Ubicaciones o bodegas (si aplica).
5.2 Gestión de reservas
 Creación de reservas por parte del profesor.
 Selección de:
o Fecha,
o Bloque horario (día completo / mañana / tarde),
o Lista de herramientas requeridas (por tipo y cantidad).
 Verificación automática de disponibilidad.
 Bloqueo de cantidades solicitadas para evitar conflictos con otras reservas.
 Edición o cancelación de reservas (con liberación de bloqueo).
Importante: La reserva no es vinculante. Es decir, garantiza disponibilidad planificada, pero
el préstamo final puede variar en cantidad y variedad bajo disponibilidad.
5.3 Gestión de préstamos
 Apertura de préstamo:
o desde una reserva o sin reserva (bajo disponibilidad).
 Asociación del préstamo a un profesor responsable.
 Registro del retiro de herramientas por estudiantes:
o cada herramienta queda asignada a un estudiante en un préstamo específico.
 Control de devolución:
o el prestamista verifica estado y marca “OK” o registra incidencia.
 Liquidación del préstamo una vez finalizada la jornada y completada la
devolución/registro de incidencias.
5.4 Módulo de reportes
El sistema incluirá reportes como:
 Disponibilidad de herramientas por fecha y bloque horario.
 Herramientas más prestadas (rotación).
 Préstamos por profesor, por fecha, por institución o por grupo.
 Historial por estudiante (herramientas usadas e incidencias).
 Herramientas con incidencias (daños/pérdidas), estado actual y tendencias.
 Herramientas en reparación o fuera de servicio.
 Reportes exportables (según alcance): PDF/Excel/CSV.
6. Usuarios y roles
El sistema manejará roles con permisos diferenciados:
 Administrador: parametrización, catálogos, usuarios, auditoría y configuración
general.
 Profesor: realiza reservas, abre préstamos, consulta reportes de sus préstamos y
gestiona su jornada.
 Prestamista/Encargado de bodega: registra entregas y devoluciones, verifica
estado, registra incidencias.
 Estudiante: asociado a retiros y devoluciones (no necesariamente necesita acceso
directo al sistema, depende del diseño).
7. Reglas de negocio principales
 Una reserva debe indicar fecha y bloque horario.
 El sistema debe validar que exista inventario disponible y:
o bloquear cantidad reservada para ese bloque,
o impedir sobre-reservas por otros usuarios.
 Una herramienta individual no puede estar:
o prestada y disponible al mismo tiempo,
o prestada y reservada para el mismo período (según reglas).
 Un préstamo no puede liquidarse si:
o existen herramientas pendientes de devolución sin estado registrado,
o o faltan confirmaciones del prestamista.
 Las herramientas devueltas deben quedar en:
o estado “Disponible” si están OK,
o estado “En reparación” o “Baja” si existe incidencia según parametrización.
8. Entidades principales del sistema (modelo conceptual)
Entidades base (según tu lista):
 TipoHerramienta
 Herramienta
 TipoUsuario
 Usuario
 Institución
 Reserva
 DetalleReserva
 Préstamo
 DetallePréstamo
 Incidencia
Entidades recomendadas para completar el modelo:
 BloqueHorario (día completo / mañana / tarde)
 EstadoHerramienta (disponible, reservada, prestada, en reparación, baja)
 Incidencia (detalle del problema)
 MovimientoHerramienta (trazabilidad: cambios de estado y asignaciones)
 Ubicación/Bodega (si hay varios puntos)
 ParámetrosSistema (políticas y reglas)
 BitácoraAuditoría (acciones del sistema)
9. Consideraciones técnicas y no funcionales
 Seguridad: autenticación, roles, registro de auditoría.
 Trazabilidad: cada movimiento relevante debe quedar registrado.
 Usabilidad: interfaz simple, rápida, diseñada para operación en campo/bodega.
 Disponibilidad: el sistema debe responder rápido en momentos pico (inicio y cierre
de jornadas).
 Integridad de datos: validaciones fuertes para evitar pérdidas de control.
 Respaldo: copias de seguridad de la base de datos.
 Escalabilidad: permitir aumento de herramientas, reservas y usuarios sin
degradación notable. 

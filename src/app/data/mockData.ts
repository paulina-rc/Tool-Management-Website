export interface Tool {
  id: string;
  code: string;
  name: string;
  type: string;
  status: 'Disponible' | 'Reservada' | 'Prestada' | 'En reparación' | 'Baja';
  location: string;
}

export interface Reservation {
  id: string;
  date: string;
  timeBlock: 'Día completo' | 'Mañana' | 'Tarde';
  professor: string;
  studentCode?: string;
  studentName?: string;
  status: 'Pendiente' | 'Confirmada' | 'Cancelada';
  /** Cada entrada = una herramienta específica del inventario */
  tools: { toolId: string; toolCode: string; toolName: string; toolType: string }[];
  /** IDs de inventario reservados (= tools.map(t => t.toolId)) */
  reservedToolIds?: string[];
  notes?: string;
}

export interface Loan {
  id: string;
  reservationId?: string;
  professor: string;
  studentCode?: string;
  studentName?: string;
  date: string;
  status: 'Abierto' | 'En curso' | 'Liquidado';
  tools: {
    toolId: string;
    toolName: string;
    student: string;
    returned: boolean;
    state?: 'OK' | 'Incidencia';
  }[];
  inventoryToolIds?: string[];
}

export interface Incident {
  id: string;
  date: string;
  tool: string;
  student: string;
  type: 'Daño' | 'Pérdida' | 'Observación';
  description: string;
  status: 'Pendiente' | 'Resuelto';
}

export interface LoanHistory {
  id: string;
  loanId: string;
  reservationId?: string;
  professor: string;
  studentCode?: string;
  studentName?: string;
  startDate: string;
  endDate: string;
  tools: {
    toolId: string;
    toolName: string;
    student: string;
    returned: boolean;
    state?: 'OK' | 'Incidencia';
  }[];
  incidentsCount: number;
}

// ─── Catálogo completo de herramientas ────────────────────────────────────────

export const mockTools: Tool[] = [
  // ── Herramientas de mano (HM) ──────────────────────────────────────────────
  { id: 'HM001', code: 'HM-001', name: 'Martillo de carpintero 500g', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 1' },
  { id: 'HM002', code: 'HM-002', name: 'Martillo de carpintero 500g', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 1' },
  { id: 'HM003', code: 'HM-003', name: 'Martillo de carpintero 500g', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 1' },
  { id: 'HM004', code: 'HM-004', name: 'Martillo de bola 300g', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 1' },
  { id: 'HM005', code: 'HM-005', name: 'Martillo de bola 300g', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 1' },
  { id: 'HM006', code: 'HM-006', name: 'Martillo de goma 400g', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 1' },
  { id: 'HM007', code: 'HM-007', name: 'Martillo de orejas Stanley', type: 'Herramienta de mano', status: 'En reparación', location: 'Almacén A — Estante 1' },
  { id: 'HM008', code: 'HM-008', name: 'Destornillador plano 6"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'HM009', code: 'HM-009', name: 'Destornillador plano 6"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'HM010', code: 'HM-010', name: 'Destornillador plano 6"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'HM011', code: 'HM-011', name: 'Destornillador plano 8"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'HM012', code: 'HM-012', name: 'Destornillador Phillips #2', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'HM013', code: 'HM-013', name: 'Destornillador Phillips #2', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'HM014', code: 'HM-014', name: 'Destornillador Phillips #2', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'HM015', code: 'HM-015', name: 'Destornillador Phillips #3', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'HM016', code: 'HM-016', name: 'Juego destornilladores de precisión', type: 'Herramienta de mano', status: 'Disponible', location: 'Taller 1' },
  { id: 'HM017', code: 'HM-017', name: 'Juego destornilladores de precisión', type: 'Herramienta de mano', status: 'Disponible', location: 'Taller 1' },
  { id: 'HM018', code: 'HM-018', name: 'Alicate universal 8"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'HM019', code: 'HM-019', name: 'Alicate universal 8"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'HM020', code: 'HM-020', name: 'Alicate universal 8"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'HM021', code: 'HM-021', name: 'Alicate universal 8"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'HM022', code: 'HM-022', name: 'Alicate de corte diagonal 6"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'HM023', code: 'HM-023', name: 'Alicate de corte diagonal 6"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'HM024', code: 'HM-024', name: 'Alicate de punta fina 6"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'HM025', code: 'HM-025', name: 'Alicate de punta fina 6"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'HM026', code: 'HM-026', name: 'Alicate de presión Vise-Grip', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'HM027', code: 'HM-027', name: 'Llave inglesa 8"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 2' },
  { id: 'HM028', code: 'HM-028', name: 'Llave inglesa 8"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 2' },
  { id: 'HM029', code: 'HM-029', name: 'Llave inglesa 10"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 2' },
  { id: 'HM030', code: 'HM-030', name: 'Llave inglesa 10"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 2' },
  { id: 'HM031', code: 'HM-031', name: 'Llave inglesa 12"', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén B — Estante 2' },
  { id: 'HM032', code: 'HM-032', name: 'Llave de tubo 14"', type: 'Herramienta de mano', status: 'Baja', location: 'Almacén B — Estante 2' },
  { id: 'HM033', code: 'HM-033', name: 'Juego llaves Allen métrico (10 piezas)', type: 'Herramienta de mano', status: 'Disponible', location: 'Taller 2' },
  { id: 'HM034', code: 'HM-034', name: 'Juego llaves Allen métrico (10 piezas)', type: 'Herramienta de mano', status: 'Disponible', location: 'Taller 2' },
  { id: 'HM035', code: 'HM-035', name: 'Juego llaves Allen en pulgadas', type: 'Herramienta de mano', status: 'Disponible', location: 'Taller 2' },
  { id: 'HM036', code: 'HM-036', name: 'Formón de madera 12mm', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén C — Estante 1' },
  { id: 'HM037', code: 'HM-037', name: 'Formón de madera 18mm', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén C — Estante 1' },
  { id: 'HM038', code: 'HM-038', name: 'Formón de madera 25mm', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén C — Estante 1' },
  { id: 'HM039', code: 'HM-039', name: 'Formón de madera 32mm', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén C — Estante 1' },
  { id: 'HM040', code: 'HM-040', name: 'Serrucho de costilla 18"', type: 'Herramienta de mano', status: 'Disponible', location: 'Taller 1' },
  { id: 'HM041', code: 'HM-041', name: 'Serrucho de costilla 18"', type: 'Herramienta de mano', status: 'Disponible', location: 'Taller 1' },
  { id: 'HM042', code: 'HM-042', name: 'Serrucho 20" Bahco', type: 'Herramienta de mano', status: 'Disponible', location: 'Taller 1' },
  { id: 'HM043', code: 'HM-043', name: 'Cúter profesional 18mm', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén C — Estante 1' },
  { id: 'HM044', code: 'HM-044', name: 'Cúter profesional 18mm', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén C — Estante 1' },
  { id: 'HM045', code: 'HM-045', name: 'Escofina plana bastarda', type: 'Herramienta de mano', status: 'Disponible', location: 'Almacén C — Estante 1' },

  // ── Herramientas eléctricas (HE) ───────────────────────────────────────────
  { id: 'HE001', code: 'HE-001', name: 'Taladro percutor 600W Bosch', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 1' },
  { id: 'HE002', code: 'HE-002', name: 'Taladro percutor 600W Bosch', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 1' },
  { id: 'HE003', code: 'HE-003', name: 'Taladro percutor 600W Bosch', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 1' },
  { id: 'HE004', code: 'HE-004', name: 'Taladro percutor 600W Bosch', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 1' },
  { id: 'HE005', code: 'HE-005', name: 'Taladro percutor 750W Makita', type: 'Herramienta eléctrica', status: 'En reparación', location: 'Taller 1' },
  { id: 'HE006', code: 'HE-006', name: 'Atornilladora inalámbrica 18V DeWalt', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 2' },
  { id: 'HE007', code: 'HE-007', name: 'Atornilladora inalámbrica 18V DeWalt', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 2' },
  { id: 'HE008', code: 'HE-008', name: 'Atornilladora inalámbrica 18V DeWalt', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 2' },
  { id: 'HE009', code: 'HE-009', name: 'Lijadora orbital 150mm Bosch', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 2' },
  { id: 'HE010', code: 'HE-010', name: 'Lijadora orbital 150mm Bosch', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 2' },
  { id: 'HE011', code: 'HE-011', name: 'Lijadora de banda 76mm Makita', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 2' },
  { id: 'HE012', code: 'HE-012', name: 'Amoladora angular 115mm Bosch', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 3' },
  { id: 'HE013', code: 'HE-013', name: 'Amoladora angular 115mm Bosch', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 3' },
  { id: 'HE014', code: 'HE-014', name: 'Amoladora angular 125mm Makita', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 3' },
  { id: 'HE015', code: 'HE-015', name: 'Sierra caladora 600W Bosch', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 3' },
  { id: 'HE016', code: 'HE-016', name: 'Sierra caladora 600W Bosch', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 3' },
  { id: 'HE017', code: 'HE-017', name: 'Sierra circular 185mm Makita', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 3' },
  { id: 'HE018', code: 'HE-018', name: 'Pistola de calor 2000W', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 1' },
  { id: 'HE019', code: 'HE-019', name: 'Pistola de calor 2000W', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 1' },
  { id: 'HE020', code: 'HE-020', name: 'Fresadora manual 900W Makita', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 3' },
  { id: 'HE021', code: 'HE-021', name: 'Compresor 24L 8 bar', type: 'Herramienta eléctrica', status: 'En reparación', location: 'Taller 3' },
  { id: 'HE022', code: 'HE-022', name: 'Pistola de silicón eléctrica', type: 'Herramienta eléctrica', status: 'Disponible', location: 'Taller 1' },

  // ── Instrumentos de medición (IM) ──────────────────────────────────────────
  { id: 'IM001', code: 'IM-001', name: 'Pie de rey digital 150mm Mitutoyo', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén A — Estante 1' },
  { id: 'IM002', code: 'IM-002', name: 'Pie de rey digital 150mm Mitutoyo', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén A — Estante 1' },
  { id: 'IM003', code: 'IM-003', name: 'Pie de rey digital 150mm Mitutoyo', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén A — Estante 1' },
  { id: 'IM004', code: 'IM-004', name: 'Pie de rey analógico 200mm', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén A — Estante 1' },
  { id: 'IM005', code: 'IM-005', name: 'Nivel de burbuja 40cm', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'IM006', code: 'IM-006', name: 'Nivel de burbuja 40cm', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'IM007', code: 'IM-007', name: 'Nivel de burbuja 60cm', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'IM008', code: 'IM-008', name: 'Nivel de burbuja 80cm', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén A — Estante 2' },
  { id: 'IM009', code: 'IM-009', name: 'Nivel láser autonivelante', type: 'Instrumento de medición', status: 'Disponible', location: 'Taller 1' },
  { id: 'IM010', code: 'IM-010', name: 'Cinta métrica 5m Stanley', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'IM011', code: 'IM-011', name: 'Cinta métrica 5m Stanley', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'IM012', code: 'IM-012', name: 'Cinta métrica 5m Stanley', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'IM013', code: 'IM-013', name: 'Cinta métrica 8m', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'IM014', code: 'IM-014', name: 'Cinta métrica 8m', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén B — Estante 1' },
  { id: 'IM015', code: 'IM-015', name: 'Multímetro digital Fluke 115', type: 'Instrumento de medición', status: 'Disponible', location: 'Taller 2' },
  { id: 'IM016', code: 'IM-016', name: 'Multímetro digital Fluke 115', type: 'Instrumento de medición', status: 'Disponible', location: 'Taller 2' },
  { id: 'IM017', code: 'IM-017', name: 'Multímetro digital Fluke 115', type: 'Instrumento de medición', status: 'Disponible', location: 'Taller 2' },
  { id: 'IM018', code: 'IM-018', name: 'Escuadra de aluminio 30cm', type: 'Instrumento de medición', status: 'Disponible', location: 'Almacén C — Estante 1' },
];

export const mockReservations: Reservation[] = [];
export const mockLoans: Loan[] = [];
export const mockIncidents: Incident[] = [];
export const mockHistory: LoanHistory[] = [];
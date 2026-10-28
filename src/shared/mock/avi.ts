import type { Role, Thread } from "@/domain/types";

export const ROLES: Record<Role, { label: string; context: string }> = {
  anon: {
    label: "Anónimo",
    context: "Público: contenido educativo y disclaimers. Sin datos clínicos.",
  },
  patient: {
    label: "Paciente",
    context: "Su PHR + historial de chats + sus datos (uuid_person).",
  },
  tutor: {
    label: "Representante / Tutor",
    context: "Los dependientes que gestiona.",
  },
  professional: {
    label: "Profesional",
    context: "Pacientes con consentimiento vigente (no «toda la data»).",
  },
  admin: {
    label: "Admin",
    context: "Operacional: catálogos, reglas, bitácora. Sin expedientes.",
  },
};

export const SUGGESTIONS: Record<Role, string[]> = {
  anon: ["¿Qué es LiberSalus?", "¿Qué puede hacer AVI?", "Contenido educativo"],
  patient: ["Registrar mi glucosa", "Crear un recordatorio", "Consultar mi historial"],
  tutor: ["Ver el perfil de mi dependiente", "Agendar cita para mi hijo"],
  professional: ["Dictar nota SOAP", "Resumen pre-consulta", "Ver pacientes con consentimiento"],
  admin: ["Configurar rangos", "Ver bitácora", "Gestionar catálogos"],
};

export const ROLE_KEYS = Object.keys(ROLES) as Role[];

export const HISTORY: Thread[] = [
  { id: 1, title: "Dudas sobre mi glucosa", when: "hoy" },
  { id: 2, title: "Recordatorio de medicamento", when: "ayer" },
  { id: 3, title: "Interpretar un resultado", when: "hace 3 días" },
];

export const CONTEXT_TIERS = [
  { level: "0", who: "Anónimo", what: "Público: educativo y disclaimers. Sin clínico." },
  { level: "1", who: "Paciente", what: "Su PHR + chat + datos (uuid_person)." },
  { level: "1b", who: "Tutor", what: "Los dependientes que gestiona." },
  { level: "2", who: "Profesional", what: "Pacientes con consentimiento vigente." },
  { level: "3", who: "Admin", what: "Operacional. Sin expedientes." },
];

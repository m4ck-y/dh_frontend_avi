import type { Role } from "@/domain/types";
import type { AviRepository } from "@/domain/repositories/AviRepository";
import { ROLES } from "@/shared/mock/avi";

export class MockAviRepository implements AviRepository {
  async reply(role: Role, text: string): Promise<string> {
    // Simulates the `dh_avi` round-trip latency.
    await new Promise((resolve) => setTimeout(resolve, 450));
    return `[simulado · ${ROLES[role].label}] Recibido: «${text}». Aquí respondería el servicio \`dh_avi\` (contexto + retrieval + LLM).`;
  }
}

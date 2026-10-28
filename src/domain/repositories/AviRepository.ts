import type { Role } from "../types";

export interface AviRepository {
  reply(role: Role, text: string): Promise<string>;
}

import type { Role } from "@/domain/types";
import type { AviRepository } from "@/domain/repositories/AviRepository";

export class AviService {
  constructor(private readonly repository: AviRepository) {}

  reply(role: Role, text: string): Promise<string> {
    return this.repository.reply(role, text);
  }
}

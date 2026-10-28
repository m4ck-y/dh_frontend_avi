import { AviService } from "@/application/services";
import { MockAviRepository } from "./repositories/mock-avi-repository";

// Composition root: wires infrastructure to application.
export const aviService = new AviService(new MockAviRepository());

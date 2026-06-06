import { Inject, Injectable } from "@nestjs/common";
import { EVENT_REPOSITORY, EventToCreate, TagToCreate } from "./event-repository.port";
import type { EventRepositoryPort } from "./event-repository.port";
import { CreateEventValidationError } from "./create-event.errors";

export type CreateEventCommand = {
  userId: string;
  fromDateTime: string;
  toDateTime: string;
  name: string;
  description?: string;
  notes?: string;
  tags?: string[];
};

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
  ) {}

  async execute(command: CreateEventCommand) {
    if (!command.userId) {
      throw new CreateEventValidationError("Usuario no identificado", ["userId"]);
    }

    if (!command.name || command.name.trim() === "") {
      throw new CreateEventValidationError("El nombre es requerido", ["name"]);
    }
    
    const fromDate = this.parseDate(command.fromDateTime, "fromDateTime");
    const toDate = this.parseDate(command.toDateTime, "toDateTime");

    if (fromDate > toDate) {
      throw new CreateEventValidationError(
        "La fecha de inicio debe ser anterior a la fecha de fin",
        ["fromDateTime", "toDateTime"],
      );
    }

    const event: EventToCreate = {
      name: command.name.trim(),
      description: command.description?.trim() ?? "",
      notes: command.notes?.trim() ?? "",
      fromDateTime: fromDate,
      toDateTime: toDate,
      userId: command.userId,
    };
    
    const tags = this.parseTags(command.tags);
    
    return this.eventRepository.createWithTags(event, tags);
  }

  private parseTags(tags: string[] = []): TagToCreate[] {
    const tagsByName = new Map<string, TagToCreate>();

    tags.forEach((tag) => {
      const label = tag.trim();
      const name = label.toLowerCase();

      if (name) tagsByName.set(name, { name, label });
    });

    return Array.from(tagsByName.values());
  }

  private parseDate(dateStr: string, field: string) {
    const date = new Date(dateStr);

    if (!dateStr || Number.isNaN(date.getTime())) {
      throw new CreateEventValidationError("Fecha inválida", [field]);
    }

    return date;
  }
}
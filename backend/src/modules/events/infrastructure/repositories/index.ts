import { PrismaEventCommentRepository } from './prisma/event-comment.repository';
import { PrismaEventRepository } from './prisma/event.repository';

export const REPOSITORIES = [
  PrismaEventCommentRepository,
  PrismaEventRepository,
];

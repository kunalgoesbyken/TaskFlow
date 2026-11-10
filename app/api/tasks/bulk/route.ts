/**
 * Bulk Task Operations API Route
 *
 * Handles bulk operations on multiple tasks at once.
 * Supported actions: delete, changeStatus, changePriority, reassign
 */

import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware/auth';
import { apiSuccess, notFound, forbidden, badRequest, serverError, handleApiError } from '@/lib/api/errors';
import { bulkRequestSchema } from '@/lib/api/schemas';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const validated = bulkRequestSchema.parse(body);

    const { taskIds, action, payload } = validated;

    // Verify user has access to all tasks
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        OR: [
          { assignedTo: user.id },
          { createdById: user.id },
        ],
      },
      select: { id: true },
    });

    if (tasks.length !== taskIds.length) {
      return forbidden('Some tasks not found or access denied');
    }

    // Execute bulk action
    switch (action) {
      case 'delete': {
        // Intentionally no task event creation for delete:
        // Events are foreign-keyed to tasks and would be cascaded away.
        await prisma.task.deleteMany({
          where: { id: { in: taskIds } },
        });
        break;
      }

      case 'changeStatus': {
        const status = payload?.status;
        await prisma.$transaction([
          prisma.task.updateMany({
            where: { id: { in: taskIds } },
            data: { status },
          }),
          prisma.taskEvent.createMany({
            data: taskIds.map((taskId) => ({
              taskId,
              eventType: 'STATUS_CHANGED',
              newStatus: status,
              changedById: user.id,
            })),
          }),
        ]);
        break;
      }

      case 'changePriority': {
        const priority = payload?.priority;
        await prisma.$transaction([
          prisma.task.updateMany({
            where: { id: { in: taskIds } },
            data: { priority },
          }),
          prisma.taskEvent.createMany({
            data: taskIds.map((taskId) => ({
              taskId,
              eventType: 'PRIORITY_CHANGED',
              newPriority: priority,
              changedById: user.id,
            })),
          }),
        ]);
        break;
      }

      case 'reassign': {
        const assignedTo = payload?.assignedTo;
        // Verify assignee exists
        const assignee = await prisma.user.findUnique({
          where: { id: assignedTo },
          select: { id: true },
        });
        if (!assignee) {
          return notFound('Assignee not found');
        }
        await prisma.$transaction([
          prisma.task.updateMany({
            where: { id: { in: taskIds } },
            data: { assignedTo },
          }),
          prisma.taskEvent.createMany({
            data: taskIds.map((taskId) => ({
              taskId,
              eventType: 'ASSIGNED',
              changedById: user.id,
            })),
          }),
        ]);
        break;
      }

      default:
        return badRequest('Unknown action');
    }

    return apiSuccess({ affected: taskIds.length });
  } catch (error) {
    const handled = handleApiError(error, 'POST /api/tasks/bulk');
    if (handled) return handled;

    return serverError('Failed to perform bulk action');
  }
}

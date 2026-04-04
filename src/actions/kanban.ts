'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/requireAuth';
import { getCurrentTempleId } from '@/actions/core';

export async function getKanbanTasks() {
  const templeId = await getCurrentTempleId();
  return prisma.kanbanTask.findMany({
    where: { templeId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createKanbanTask(data: {
  title: string;
  description?: string;
  priority: string;
  assignee?: string;
}) {
  const session = await requireAuth();
  const templeId = await getCurrentTempleId();

  try {
    const task = await prisma.kanbanTask.create({
      data: {
        templeId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        assignee: data.assignee,
        status: 'TODO'
      }
    });

    await prisma.auditLog.create({
      data: {
        templeId,
        userId: session.userId,
        userEmail: session.userId,
        action: 'CREATE_TASK',
        detail: `Δημιουργήθηκε νέα εργασία: ${data.title}`
      }
    });

    return { success: true, task };
  } catch (e: any) {
    return { success: false, error: 'Αποτυχία δημιουργίας εργασίας.' };
  }
}

export async function updateKanbanTaskStatus(taskId: string, newStatus: string) {
  const templeId = await getCurrentTempleId();

  try {
    const task = await prisma.kanbanTask.updateMany({
      where: { id: taskId, templeId },
      data: { status: newStatus }
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: 'Αποτυχία ενημέρωσης κατάστασης.' };
  }
}

export async function deleteKanbanTask(taskId: string) {
  const templeId = await getCurrentTempleId();

  try {
    await prisma.kanbanTask.deleteMany({
      where: { id: taskId, templeId }
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: 'Αποτυχία διαγραφής εργασίας.' };
  }
}

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAuthUser } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { TimezoneLanesContent } from './TimezoneLanesContent';

export const metadata: Metadata = {
  title: 'Timezone Lanes',
};

export const dynamic = 'force-dynamic';

async function getTeamData() {
  const [users, tasks] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        timezone: true,
      },
      orderBy: { email: 'asc' },
    }),
    // Limit to 100 active tasks for timezone lanes performance
    // Prioritize recently updated tasks
    prisma.task.findMany({
      where: {
        status: { not: 'DONE' },
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        assignedTo: true,
        githubIssueNumber: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    }),
  ]);

  return { users, tasks };
}

export default async function TimezoneLanesPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const { users, tasks } = await getTeamData();

  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading dashboard...</div>}>
      <DashboardSidebar users={users} userEmail={user.email ?? 'Unknown'}>
        <TimezoneLanesContent users={users} tasks={tasks} />
      </DashboardSidebar>
    </Suspense>
  );
}

import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { EventType, TaskPriority, TaskStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { env } from '@/lib/env';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

const uuid = (n: number) => `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`;

const TEAM = [
  { id: uuid(1), email: 'demo@taskflow.dev', timezone: 'America/Los_Angeles' },
  { id: uuid(2), email: 'priya@taskflow.dev', timezone: 'Asia/Kolkata' },
  { id: uuid(3), email: 'tom@taskflow.dev', timezone: 'Europe/London' },
  { id: uuid(4), email: 'aiko@taskflow.dev', timezone: 'Asia/Tokyo' },
  { id: uuid(5), email: 'lucas@taskflow.dev', timezone: 'America/Sao_Paulo' },
];

const [demo, priya, tom, aiko, lucas] = TEAM.map((member) => member.id);

const TEMPLATE_ID = uuid(100);

const TEMPLATE_STEPS = [
  {
    status: 'OPEN',
    requiredFields: [
      { name: 'requirements', type: 'textarea', label: 'Requirements', required: true },
      { name: 'acceptanceCriteria', type: 'textarea', label: 'Acceptance Criteria', required: true },
    ],
    allowedTransitions: ['IN_PROGRESS'],
  },
  {
    status: 'IN_PROGRESS',
    requiredFields: [
      { name: 'branch', type: 'text', label: 'Git Branch', required: true },
      { name: 'estimatedHours', type: 'number', label: 'Estimate (hours)', required: true },
    ],
    allowedTransitions: ['READY_FOR_REVIEW'],
  },
  {
    status: 'READY_FOR_REVIEW',
    requiredFields: [{ name: 'prLink', type: 'text', label: 'PR Link', required: true }],
    allowedTransitions: ['DONE'],
  },
];

const { OPEN, IN_PROGRESS, READY_FOR_REVIEW, DONE } = TaskStatus;
const { LOW, MEDIUM, HIGH } = TaskPriority;

const FLOW: TaskStatus[] = [OPEN, IN_PROGRESS, READY_FOR_REVIEW, DONE];

type TaskSeed = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: string;
  assignedTo: string;
  ageDays: number;
  dueInDays: number | null;
};

const TASKS: TaskSeed[] = [
  { title: 'Fix payment webhook retries', description: 'Stripe webhooks are dropped after the second failure. Hand off to the EU shift for the morning release.', status: IN_PROGRESS, priority: HIGH, createdBy: demo, assignedTo: tom, ageDays: 3, dueInDays: 1 },
  { title: 'Migrate sessions table to composite index', description: 'Query plan shows a sequential scan on login. Index migration needs a maintenance window.', status: IN_PROGRESS, priority: HIGH, createdBy: priya, assignedTo: demo, ageDays: 4, dueInDays: 2 },
  { title: 'Review onboarding checklist copy', description: 'Product wants a pass on tone before the Monday launch.', status: READY_FOR_REVIEW, priority: MEDIUM, createdBy: aiko, assignedTo: demo, ageDays: 5, dueInDays: 1 },
  { title: 'Add rate limiting to public API', description: 'Token bucket per API key, 100 requests per minute, with a 429 response and Retry-After header.', status: OPEN, priority: HIGH, createdBy: demo, assignedTo: priya, ageDays: 2, dueInDays: 5 },
  { title: 'Dashboard empty state illustrations', description: 'Replace the placeholder icons with the new illustration set.', status: OPEN, priority: LOW, createdBy: demo, assignedTo: lucas, ageDays: 6, dueInDays: 9 },
  { title: 'Upgrade Next.js to latest minor', description: 'Bump the framework, fix the type errors and re-run the end-to-end suite.', status: DONE, priority: MEDIUM, createdBy: tom, assignedTo: demo, ageDays: 9, dueInDays: null },
  { title: 'Write runbook for database failover', description: 'Document the promote-replica steps and who to page in each timezone.', status: READY_FOR_REVIEW, priority: MEDIUM, createdBy: demo, assignedTo: aiko, ageDays: 7, dueInDays: 3 },
  { title: 'Localize invoice emails to Japanese', description: 'Strings are in the shared sheet. Needs a native review before shipping.', status: IN_PROGRESS, priority: MEDIUM, createdBy: demo, assignedTo: aiko, ageDays: 5, dueInDays: 4 },
  { title: 'Audit unused feature flags', description: 'List flags with no reads in 30 days and open removal PRs.', status: OPEN, priority: LOW, createdBy: lucas, assignedTo: demo, ageDays: 8, dueInDays: 14 },
  { title: 'Set up synthetic uptime checks', description: 'Probe login and checkout from three regions and alert on two consecutive failures.', status: DONE, priority: HIGH, createdBy: demo, assignedTo: priya, ageDays: 12, dueInDays: null },
  { title: 'Investigate slow CSV export', description: 'Exports above 50k rows time out. Stream the response instead of buffering.', status: IN_PROGRESS, priority: HIGH, createdBy: tom, assignedTo: demo, ageDays: 2, dueInDays: 2 },
  { title: 'Refresh pricing page screenshots', description: 'Capture the new plan cards in light and dark themes.', status: DONE, priority: LOW, createdBy: demo, assignedTo: lucas, ageDays: 10, dueInDays: null },
  { title: 'Handoff: on-call notes for weekend', description: 'Open incidents, known flaky alerts and escalation contacts for the weekend rotation.', status: OPEN, priority: MEDIUM, createdBy: demo, assignedTo: tom, ageDays: 1, dueInDays: 3 },
  { title: 'Reduce bundle size of analytics page', description: 'Lazy-load the chart library and drop the unused locale files.', status: OPEN, priority: MEDIUM, createdBy: priya, assignedTo: demo, ageDays: 3, dueInDays: 7 },
  { title: 'Customer interview synthesis', description: 'Cluster the twelve interview notes into themes and share the deck.', status: DONE, priority: MEDIUM, createdBy: aiko, assignedTo: demo, ageDays: 11, dueInDays: null },
  { title: 'Fix timezone offset in shift handoff emails', description: 'Daylight saving changes shift the send time by an hour for Sao Paulo.', status: READY_FOR_REVIEW, priority: HIGH, createdBy: lucas, assignedTo: tom, ageDays: 4, dueInDays: 1 },
];

const NOTIFICATIONS = [
  { task: 1, message: 'Priya assigned you "Migrate sessions table to composite index"', read: false, hoursAgo: 2 },
  { task: 2, message: 'Aiko moved "Review onboarding checklist copy" to Ready for Review', read: false, hoursAgo: 5 },
  { task: 10, message: 'Tom assigned you "Investigate slow CSV export"', read: false, hoursAgo: 9 },
  { task: 5, message: 'Tom marked "Upgrade Next.js to latest minor" as Done', read: true, hoursAgo: 40 },
];

const demoPassword = () =>
  createHmac('sha256', env.ENCRYPTION_KEY).update('taskflow-demo').digest('hex');

export function getDemoCredentials() {
  return { email: TEAM[0].email, password: demoPassword() };
}

async function ensureAuthUser() {
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { email, password } = getDemoCredentials();
  const { error } = await admin.auth.admin.createUser({
    id: demo,
    email,
    password,
    email_confirm: true,
  });
  if (!error) return;
  if (!/already|exists|registered/i.test(error.message)) throw error;
  await admin.auth.admin.updateUserById(demo, { password });
}

async function seedWorkspace() {
  const now = Date.now();

  await prisma.user.createMany({ data: TEAM, skipDuplicates: true });

  await prisma.handoffTemplate.createMany({
    data: [
      {
        id: TEMPLATE_ID,
        name: 'Feature Development',
        description: 'Standard workflow for feature development',
        steps: TEMPLATE_STEPS,
        createdById: demo,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.task.createMany({
    data: TASKS.map((task, index) => ({
      id: uuid(1000 + index),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      createdById: task.createdBy,
      assignedTo: task.assignedTo,
      createdAt: new Date(now - task.ageDays * DAY),
      updatedAt: new Date(now - Math.max(task.ageDays - 2, 0) * DAY),
      dueDate: task.dueInDays === null ? null : new Date(now + task.dueInDays * DAY),
      templateId: index === 0 ? TEMPLATE_ID : null,
    })),
    skipDuplicates: true,
  });

  await prisma.taskEvent.createMany({
    data: TASKS.flatMap((task, index) => {
      const taskId = uuid(1000 + index);
      const created = {
        id: uuid(2000 + index * 10),
        taskId,
        eventType: EventType.CREATED,
        changedById: task.createdBy,
        createdAt: new Date(now - task.ageDays * DAY),
      };
      const transitions = FLOW.slice(1, FLOW.indexOf(task.status) + 1).map((status, step) => ({
        id: uuid(2000 + index * 10 + step + 1),
        taskId,
        eventType: status === DONE ? EventType.COMPLETED : EventType.STATUS_CHANGED,
        oldStatus: FLOW[step],
        newStatus: status,
        changedById: task.assignedTo,
        createdAt: new Date(now - Math.max(task.ageDays - step - 1, 0) * DAY),
      }));
      return [created, ...transitions];
    }),
    skipDuplicates: true,
  });

  await prisma.notification.createMany({
    data: NOTIFICATIONS.map((notification, index) => ({
      id: uuid(3000 + index),
      userId: demo,
      taskId: uuid(1000 + notification.task),
      message: notification.message,
      read: notification.read,
      createdAt: new Date(now - notification.hoursAgo * HOUR),
    })),
    skipDuplicates: true,
  });
}

export async function ensureDemoWorkspace() {
  await ensureAuthUser();
  await seedWorkspace();
}

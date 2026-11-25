import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  createTaskRequest,
  deleteTaskRequest,
  listEventTasksRequest,
  updateTaskRequest,
} from '../../api/tasks.js';
import { listUsersRequest } from '../../api/users.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { fromISTInputValue } from '../../utils/dates.js';
import ConfettiBurst from '../common/ConfettiBurst.jsx';
import Loader from '../common/Loader.jsx';
import TaskCard from './TaskCard.jsx';

const COLUMNS = [
  { key: 'todo', label: 'To do', accent: 'border-t-slate-400' },
  { key: 'in_progress', label: 'In progress', accent: 'border-t-gdg-blue' },
  { key: 'done', label: 'Done', accent: 'border-t-gdg-green' },
];

const DOMAINS = ['tech', 'design', 'pr', 'content', 'logistics', 'outreach'];

export default function TaskBoard({ eventId, canEdit }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState('tech');
  const [newPriority, setNewPriority] = useState('medium');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [adding, setAdding] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [tasksData, usersData] = await Promise.all([
        listEventTasksRequest(eventId),
        canEdit ? listUsersRequest().catch(() => []) : Promise.resolve([]),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [eventId, canEdit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      const updated = await updateTaskRequest(taskId, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
      if (nextStatus === 'done') {
        setCelebrate(true);
        showToast('Task marked done!', 'success');
        setTimeout(() => setCelebrate(false), 1800);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTaskRequest(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      showToast('Task deleted', 'info');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate) return;
    setAdding(true);
    try {
      const created = await createTaskRequest(eventId, {
        title: newTitle.trim(),
        domain: newDomain,
        priority: newPriority,
        assignee: newAssignee || null,
        dueDate: fromISTInputValue(`${newDueDate}T18:00`),
      });
      setTasks((prev) => [...prev, created]);
      setNewTitle('');
      setNewAssignee('');
      setNewDueDate('');
      showToast('Task added', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setAdding(false);
    }
  };

  const filtered = tasks.filter((t) => {
    if (domainFilter && t.domain !== domainFilter) return false;
    if (assigneeFilter && (t.assignee?._id || '') !== assigneeFilter) return false;
    return true;
  });

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  if (loading) return <Loader label="Loading task board..." />;

  return (
    <div className="space-y-5">
      <ConfettiBurst active={celebrate} />

      {error && (
        <div className="rounded-xl border border-gdg-red/30 bg-gdg-red/10 px-4 py-3 text-sm text-gdg-red">
          {error}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--text-secondary)]">
              Event checklist progress ({doneCount} / {tasks.length})
            </span>
            <span className="font-mono font-semibold text-gdg-green">{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
            <div
              className="h-full rounded-full bg-gdg-green transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {canEdit && (
        <form
          onSubmit={handleCreate}
          className="grid gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:grid-cols-6"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New task title..."
            required
            className="min-h-[40px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm sm:col-span-2"
          />
          <select
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="min-h-[40px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm capitalize"
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="min-h-[40px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm capitalize"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            className="min-h-[40px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              required
              className="min-h-[40px] min-w-0 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={adding}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-xl bg-gdg-blue px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
              aria-label="Add task"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
        >
          <option value="">All domains</option>
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {users.length > 0 && (
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]"
          >
            <option value="">All assignees</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedTaskId) {
                  handleStatusChange(draggedTaskId, col.key);
                  setDraggedTaskId(null);
                }
              }}
              className={`min-h-[260px] rounded-2xl border border-[var(--border-subtle)] border-t-4 ${col.accent} bg-[var(--bg-subtle)]/60 p-3.5`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{col.label}</h3>
                <span className="rounded-full bg-[var(--bg-surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {colTasks.map((task) => {
                  const isAssignee =
                    task.assignee && (task.assignee._id || task.assignee) === user?.id;
                  return (
                    <TaskCard
                      key={task._id}
                      task={task}
                      canEdit={canEdit}
                      canMove={canEdit || isAssignee}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onDragStart={(_e, t) => setDraggedTaskId(t._id)}
                    />
                  );
                })}
                {colTasks.length === 0 && (
                  <p className="py-6 text-center text-xs text-[var(--text-muted)]">No tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

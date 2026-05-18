import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Download,
  Edit3,
  Loader2,
  LogOut,
  Moon,
  Plus,
  Search,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { leadApi } from '@/api/leads';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import type { Lead, LeadFilters, LeadPayload, LeadSource, LeadStatus, SortOrder } from '@/types';

const statuses: Array<LeadStatus | ''> = ['', 'New', 'Contacted', 'Qualified', 'Lost'];
const sources: Array<LeadSource | ''> = ['', 'Website', 'Instagram', 'Referral'];

const emptyPayload: LeadPayload = {
  name: '',
  email: '',
  status: 'New',
  source: 'Website',
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'response' in error) {
    const maybeAxios = error as { response?: { data?: { message?: string } } };
    return maybeAxios.response?.data?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<LeadFilters>({
    status: '',
    source: '',
    search: '',
    sort: 'latest',
    page: 1,
    limit: 10,
  });
  const [draftSearch, setDraftSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<LeadPayload>(emptyPayload);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const debouncedSearch = useDebounce(draftSearch);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    setFilters((current) => ({ ...current, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const activeFilters = useMemo(() => filters, [filters]);

  const fetchLeads = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await leadApi.list(activeFilters);
      setLeads(response.data);
      setPagination(response.pagination);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, 'Could not load leads'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchLeads();
  }, [activeFilters]);

  const openCreate = () => {
    setEditingLead(null);
    setForm({ ...emptyPayload });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name,
      email: lead.email,
      status: lead.status,
      source: lead.source,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingLead(null);
    setForm({ ...emptyPayload });
    setFormErrors({});
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email';
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitLead = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      if (editingLead) {
        await leadApi.update(editingLead._id, form);
        toast.success('Lead updated');
      } else {
        await leadApi.create(form);
        toast.success('Lead created');
      }
      closeForm();
      await fetchLeads();
    } catch (saveError) {
      toast.error(getErrorMessage(saveError, 'Could not save lead'));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteLead = async (lead: Lead) => {
    if (!window.confirm(`Delete ${lead.name}?`)) return;
    try {
      await leadApi.remove(lead._id);
      toast.success('Lead deleted');
      await fetchLeads();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, 'Could not delete lead'));
    }
  };

  const exportCsv = async () => {
    try {
      const blob = await leadApi.exportCsv(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'smart-leads.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      toast.error(getErrorMessage(exportError, 'Could not export CSV'));
    }
  };

  const ownerLabel = (lead: Lead) => {
    if (typeof lead.owner === 'string') return 'Assigned user';
    return lead.owner.name;
  };

  return (
    <main className="min-h-screen bg-field text-ink dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal">Smart Leads</p>
            <h1 className="mt-1 text-2xl font-bold">Lead Management Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {user?.name} · {user?.role === 'admin' ? 'Admin access' : 'Sales user access'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsDark((value) => !value)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-700"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              Theme
            </button>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-700"
            >
              <Download size={16} />
              CSV
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-md bg-teal px-3 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Lead
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white dark:bg-slate-700"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_180px_180px_150px]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 dark:border-slate-700 dark:bg-slate-950"
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="Search name or email"
            />
          </label>
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value as LeadStatus | '', page: 1 })}
          >
            {statuses.map((status) => (
              <option key={status || 'all'} value={status}>
                {status || 'All statuses'}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={filters.source}
            onChange={(event) => setFilters({ ...filters, source: event.target.value as LeadSource | '', page: 1 })}
          >
            {sources.map((source) => (
              <option key={source || 'all'} value={source}>
                {source || 'All sources'}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            value={filters.sort}
            onChange={(event) => setFilters({ ...filters, sort: event.target.value as SortOrder, page: 1 })}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
          {isLoading ? (
            <div className="grid min-h-72 place-items-center">
              <Loader2 className="h-8 w-8 animate-spin text-teal" />
            </div>
          ) : leads.length === 0 ? (
            <div className="p-4">
              <EmptyState />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Lead</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <td className="px-4 py-3">
                        <button className="text-left" onClick={() => setViewingLead(lead)}>
                          <span className="block font-semibold text-ink dark:text-white">{lead.name}</span>
                          <span className="text-slate-500 dark:text-slate-400">{lead.email}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 py-3">{lead.source}</td>
                      <td className="px-4 py-3">{ownerLabel(lead)}</td>
                      <td className="px-4 py-3">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            aria-label="Edit lead"
                            onClick={() => openEdit(lead)}
                            className="rounded-md border border-slate-300 p-2 text-slate-600 hover:text-teal dark:border-slate-700 dark:text-slate-300"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            aria-label="Delete lead"
                            onClick={() => void deleteLead(lead)}
                            className="rounded-md border border-slate-300 p-2 text-slate-600 hover:text-coral dark:border-slate-700 dark:text-slate-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing page {pagination.page} of {Math.max(pagination.totalPages, 1)} · {pagination.total} total leads
          </p>
          <div className="flex gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              className="rounded-md border border-slate-300 px-3 py-2 font-semibold disabled:opacity-50 dark:border-slate-700"
            >
              Previous
            </button>
            <button
              disabled={filters.page >= Math.max(pagination.totalPages, 1)}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              className="rounded-md border border-slate-300 px-3 py-2 font-semibold disabled:opacity-50 dark:border-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/50 p-4">
          <form onSubmit={submitLead} className="w-full max-w-lg rounded-lg bg-white p-5 shadow-soft dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingLead ? 'Edit lead' : 'Create lead'}</h2>
              <button type="button" onClick={closeForm} aria-label="Close form">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-medium">
                Name
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
                {formErrors.name && <span className="mt-1 block text-xs text-coral">{formErrors.name}</span>}
              </label>
              <label className="sm:col-span-2 text-sm font-medium">
                Email
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  type="email"
                />
                {formErrors.email && <span className="mt-1 block text-xs text-coral">{formErrors.email}</span>}
              </label>
              <label className="text-sm font-medium">
                Status
                <select
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as LeadStatus })}
                >
                  {statuses.filter((status): status is LeadStatus => Boolean(status)).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Source
                <select
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  value={form.source}
                  onChange={(event) => setForm({ ...form, source: event.target.value as LeadSource })}
                >
                  {sources.filter((source): source is LeadSource => Boolean(source)).map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeForm} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700">
                Cancel
              </button>
              <button disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save lead
              </button>
            </div>
          </form>
        </div>
      )}

      {viewingLead && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{viewingLead.name}</h2>
              <button aria-label="Close details" onClick={() => setViewingLead(null)}>
                <X size={20} />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium">{viewingLead.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1"><StatusBadge status={viewingLead.status} /></dd>
              </div>
              <div>
                <dt className="text-slate-500">Source</dt>
                <dd className="font-medium">{viewingLead.source}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Created at</dt>
                <dd className="font-medium">{new Date(viewingLead.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </main>
  );
};

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales' as UserRole,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email';
    if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-field px-4 py-10 dark:bg-slate-950">
      <section className="w-full max-w-md">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">Smart Leads</p>
          <h1 className="mt-3 text-3xl font-bold text-ink dark:text-white">Create account</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Choose the role reviewers should use for this account.
          </p>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Full name
            <input
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 dark:border-slate-700 dark:bg-slate-950"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Asha Mehta"
            />
          </label>
          {errors.name && <p className="mt-1 text-xs text-coral">{errors.name}</p>}

          <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
            <input
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 dark:border-slate-700 dark:bg-slate-950"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="asha@example.com"
              type="email"
            />
          </label>
          {errors.email && <p className="mt-1 text-xs text-coral">{errors.email}</p>}

          <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Password
            <span className="relative mt-2 block">
              <input
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 dark:border-slate-700 dark:bg-slate-950"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="Minimum 6 characters"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          {errors.password && <p className="mt-1 text-xs text-coral">{errors.password}</p>}

          <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Role
            <select
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 dark:border-slate-700 dark:bg-slate-950"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
            >
              <option value="sales">Sales User</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button
            disabled={isLoading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create account
          </button>

          <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
            Already registered?{' '}
            <Link className="font-semibold text-teal hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email';
    if (!form.password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      await login(form.email, form.password);
      toast.success('Welcome back');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-field px-4 py-10 dark:bg-slate-950">
      <section className="w-full max-w-md">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">Smart Leads</p>
          <h1 className="mt-3 text-3xl font-bold text-ink dark:text-white">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Use the seeded account or your registered profile.
          </p>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
            <input
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20 dark:border-slate-700 dark:bg-slate-950"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="admin@smartleads.dev"
              type="email"
              autoComplete="email"
            />
          </label>
          {errors.email && <p className="mt-1 text-xs text-coral">{errors.email}</p>}

          <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Password
            <span className="relative mt-2 block">
              <input
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20 dark:border-slate-700 dark:bg-slate-950"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="Password123"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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

          <button
            disabled={isLoading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Sign in
          </button>

          <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
            New here?{' '}
            <Link className="font-semibold text-teal hover:underline" to="/register">
              Create account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

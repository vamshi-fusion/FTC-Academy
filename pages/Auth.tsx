import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const { isAuthenticated, login, signup, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    const result =
      mode === 'login'
        ? await login({ email, password })
        : await signup({ name, email, password });

    if ('error' in result) {
      setError(result.error);
    }

    setSubmitting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-app-bg px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-app-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-app-accent-2/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-stretch">
        <section className="rounded-3xl border border-app-line bg-white p-8 shadow-sm sm:p-10">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-app-ink text-white">
            <ShieldCheck size={22} />
          </div>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.25em] text-app-muted">FTC Academy</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-app-ink sm:text-4xl">Train smarter. Build faster. Compete better.</h1>
          <p className="mt-4 text-sm text-app-muted sm:text-base">Create an account to keep your learning profile synced on this browser, or continue as a guest and start immediately.</p>
          <ul className="mt-6 space-y-2 text-sm text-app-muted">
            <li>Track lessons, challenge completions, and XP.</li>
            <li>Earn achievement badges as you progress.</li>
            <li>Keep separate data for each account or guest mode.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-app-line bg-white p-7 shadow-sm sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-app-panel p-1">
            <button
              onClick={() => setMode('login')}
              className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
                mode === 'login' ? 'bg-app-ink text-white' : 'text-app-muted hover:text-app-ink'
              }`}
              type="button"
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
                mode === 'signup' ? 'bg-app-ink text-white' : 'text-app-muted hover:text-app-ink'
              }`}
              type="button"
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-app-muted">Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  required
                  className="w-full rounded-xl border border-app-line bg-white px-4 py-2.5 text-sm text-app-ink outline-none transition-colors focus:border-app-accent"
                  placeholder="Driver Name"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-app-muted">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="w-full rounded-xl border border-app-line bg-white px-4 py-2.5 text-sm text-app-ink outline-none transition-colors focus:border-app-accent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-app-muted">Password</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                className="w-full rounded-xl border border-app-line bg-white px-4 py-2.5 text-sm text-app-ink outline-none transition-colors focus:border-app-accent"
                placeholder="At least 6 characters"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-app-muted">Confirm Password</label>
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  required
                  className="w-full rounded-xl border border-app-line bg-white px-4 py-2.5 text-sm text-app-ink outline-none transition-colors focus:border-app-accent"
                  placeholder="Re-enter password"
                />
              </div>
            )}

            {error && <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-app-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-app-accent disabled:opacity-60"
            >
              {mode === 'login' ? <LogIn size={14} className="mr-2" /> : <UserPlus size={14} className="mr-2" />}
              {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-app-line" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-app-muted">or</span>
            <div className="h-px flex-1 bg-app-line" />
          </div>

          <button
            type="button"
            onClick={continueAsGuest}
            className="inline-flex w-full items-center justify-center rounded-xl border border-app-line bg-app-panel px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-app-ink transition-colors hover:border-app-accent hover:text-app-accent"
          >
            Continue without an account <ArrowRight size={14} className="ml-2" />
          </button>
        </section>
      </div>
    </div>
  );
};

export default AuthPage;

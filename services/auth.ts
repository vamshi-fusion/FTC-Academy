export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isGuest?: boolean;
}

interface StoredUser extends PublicUser {
  passwordHash: string;
}

interface AuthStore {
  users: StoredUser[];
  currentUserId: string | null;
  isGuestSession: boolean;
}

const AUTH_STORAGE_KEY = 'ftc_auth_v1';
const AUTH_UPDATED_EVENT = 'auth_updated';

const DEFAULT_STORE: AuthStore = {
  users: [],
  currentUserId: null,
  isGuestSession: false,
};

const readStore = (): AuthStore => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return DEFAULT_STORE;

    const parsed = JSON.parse(raw) as Partial<AuthStore>;
    if (!Array.isArray(parsed.users)) return DEFAULT_STORE;

    return {
      users: parsed.users as StoredUser[],
      currentUserId: parsed.currentUserId ?? null,
      isGuestSession: parsed.isGuestSession === true,
    };
  } catch {
    return DEFAULT_STORE;
  }
};

const writeStore = (store: AuthStore) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(store));
};

const emitAuthUpdated = () => {
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
  window.dispatchEvent(new Event('progress_updated'));
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toPublicUser = (user: StoredUser): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const sha256 = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const GUEST_USER: PublicUser = {
  id: 'guest-local',
  name: 'Guest',
  email: '',
  createdAt: new Date(0).toISOString(),
  isGuest: true,
};

export const getCurrentUser = (): PublicUser | null => {
  const store = readStore();
  if (store.isGuestSession) return GUEST_USER;
  if (!store.currentUserId) return null;

  const user = store.users.find((candidate) => candidate.id === store.currentUserId);
  return user ? toPublicUser(user) : null;
};

export const isAuthenticated = (): boolean => Boolean(getCurrentUser());

export const subscribeToAuthChanges = (listener: () => void): (() => void) => {
  window.addEventListener(AUTH_UPDATED_EVENT, listener);
  return () => window.removeEventListener(AUTH_UPDATED_EVENT, listener);
};

export const signup = async (input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }> => {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (name.length < 2) return { ok: false, error: 'Name must be at least 2 characters.' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Enter a valid email address.' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

  const store = readStore();
  const exists = store.users.some((user) => user.email === email);
  if (exists) return { ok: false, error: 'An account with this email already exists.' };

  const user: StoredUser = {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    email,
    passwordHash: await sha256(password),
    createdAt: new Date().toISOString(),
  };

  const nextStore: AuthStore = {
    users: [...store.users, user],
    currentUserId: user.id,
    isGuestSession: false,
  };

  writeStore(nextStore);
  emitAuthUpdated();

  return { ok: true, user: toPublicUser(user) };
};

export const login = async (input: {
  email: string;
  password: string;
}): Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }> => {
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!email || !password) return { ok: false, error: 'Email and password are required.' };

  const store = readStore();
  const user = store.users.find((candidate) => candidate.email === email);
  if (!user) return { ok: false, error: 'Invalid email or password.' };

  const matches = user.passwordHash === (await sha256(password));
  if (!matches) return { ok: false, error: 'Invalid email or password.' };

  writeStore({ ...store, currentUserId: user.id, isGuestSession: false });
  emitAuthUpdated();

  return { ok: true, user: toPublicUser(user) };
};

export const logout = () => {
  const store = readStore();
  writeStore({ ...store, currentUserId: null, isGuestSession: false });
  emitAuthUpdated();
};

export const continueAsGuest = () => {
  const store = readStore();
  writeStore({ ...store, currentUserId: null, isGuestSession: true });
  emitAuthUpdated();
};

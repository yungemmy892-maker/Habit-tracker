import { User, Session } from '@/types/auth';
import { getUsers, setUsers, getSession, setSession } from './storage';

export function signUp(email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers();
  const exists = users.find((u) => u.email === email);

  if (exists) {
    return { success: false, error: 'User already exists' };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  setUsers([...users, newUser]);
  setSession({ userId: newUser.id, email: newUser.email });

  return { success: true };
}

export function logIn(email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  setSession({ userId: user.id, email: user.email });
  return { success: true };
}

export function logOut(): void {
  setSession(null);
}

export function getCurrentSession(): Session | null {
  return getSession();
}

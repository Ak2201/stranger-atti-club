import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export type Role = 'user' | 'admin' | 'super_admin' | 'vendor';

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: Role;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id: (session.user as any).id,
    email: session.user.email!,
    name: session.user.name,
    image: session.user.image,
    role: ((session.user as any).role as Role) ?? 'user',
  };
}

export async function requireUser(redirectTo = '/signin'): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(redirectTo);
  return user!;
}

export function isAdmin(user: SessionUser | null | undefined): boolean {
  return user?.role === 'admin' || user?.role === 'super_admin';
}

export function isSuperAdmin(user: SessionUser | null | undefined): boolean {
  return user?.role === 'super_admin';
}

export function isVendor(user: SessionUser | null | undefined): boolean {
  return user?.role === 'vendor';
}

/** Vendor, admin, and super_admin all have redeem + check-in access. */
export function hasRedeemAccess(user: SessionUser | null | undefined): boolean {
  return (
    user?.role === 'vendor' ||
    user?.role === 'admin' ||
    user?.role === 'super_admin'
  );
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/signin?from=/admin');
  if (!isAdmin(user)) {
    // Vendors get bounced to their workspace, not back to /me
    if (isVendor(user)) redirect('/admin/redeem');
    redirect('/me?error=not-admin');
  }
  return user;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/signin?from=/admin');
  if (!isSuperAdmin(user)) {
    if (isVendor(user)) redirect('/admin/redeem');
    redirect('/admin?error=super-admin-required');
  }
  return user;
}

export async function requireRedeemAccess(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/signin?from=/admin/redeem');
  if (!hasRedeemAccess(user)) redirect('/me?error=not-staff');
  return user;
}

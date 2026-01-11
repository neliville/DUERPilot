'use client';

import { AdminSidebar } from './admin-sidebar';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    [key: string]: any;
  };
  userProfile: {
    id: string;
    email: string;
    isSuperAdmin: boolean;
    roles: string[];
    [key: string]: any;
  };
}

export function AdminLayoutClient({ children, user, userProfile }: AdminLayoutClientProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar user={user} userProfile={userProfile} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-6">
          {children}
        </div>
      </main>
    </div>
  );
}


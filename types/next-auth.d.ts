import { UserRole } from '@/types';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      roles: UserRole[];
      tenantId: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    roles: UserRole[];
    tenantId: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles: UserRole[];
    tenantId: string;
  }
}


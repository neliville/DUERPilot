import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from './utils';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [currentPageName]);

  // Fetch user profile
  const { data: userProfiles, isLoading: loadingProfile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    staleTime: 0, // Always refetch
    refetchOnMount: true, // Refetch on mount
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
  const userProfile = userProfiles?.[0];

  // Fetch company for current tenant
  const { data: companies = [] } = useQuery({
    queryKey: ['company', userProfile?.tenant_id],
    queryFn: () => base44.entities.Company.filter({ tenant_id: userProfile?.tenant_id }),
    enabled: !!userProfile?.tenant_id,
  });
  const company = companies[0];

  if (loading || (user?.email && loadingProfile)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Pages that don't need layout (like onboarding)
  const noLayoutPages = ['Onboarding', 'Login'];
  if (noLayoutPages.includes(currentPageName)) {
    return children;
  }

  // Redirect to onboarding if user has no profile with tenant_id
  // Only check after userProfiles query has completed
  if (user?.email && userProfiles !== undefined) {
    const hasValidProfile = userProfiles.length > 0 && userProfiles[0]?.tenant_id;
    if (!hasValidProfile) {
      window.location.href = createPageUrl('Onboarding');
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500">Redirection...</p>
          </div>
        </div>
      );
    }
  }

  const userRole = userProfile?.app_role || 'operator';

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        userRole={userRole} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <Header 
          user={user} 
          userProfile={userProfile}
          company={company}
        />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
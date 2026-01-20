import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import {
  LayoutDashboard,
  Building2,
  Shield,
  FileText,
  ClipboardList,
  History,
  AlertTriangle,
  Users,
  Settings,
  BookOpen,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const roleMenuItems = {
  super_admin: [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' },
    { icon: Building2, label: 'Tenants', page: 'Tenants' },
    { icon: Users, label: 'Utilisateurs', page: 'Users' },
    { icon: BookOpen, label: 'Référentiel', page: 'HazardCatalog' },
    { icon: History, label: 'Audit Logs', page: 'AuditLogs' },
  ],
  admin_tenant: [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' },
    { icon: Building2, label: 'Entreprise', page: 'CompanySettings' },
    { icon: Shield, label: 'DUERP', page: 'DuerpWizard' },
    { icon: ClipboardList, label: 'Actions', page: 'ActionPlans' },
    { icon: History, label: 'Historique', page: 'DuerpHistory' },
    { icon: BookOpen, label: 'Référentiel', page: 'HazardCatalog' },
    { icon: Users, label: 'Utilisateurs', page: 'Users' },
    { icon: Eye, label: 'Observations', page: 'Observations' },
  ],
  qse: [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' },
    { icon: Shield, label: 'DUERP', page: 'DuerpWizard' },
    { icon: ClipboardList, label: 'Actions', page: 'ActionPlans' },
    { icon: History, label: 'Historique', page: 'DuerpHistory' },
    { icon: BookOpen, label: 'Référentiel', page: 'HazardCatalog' },
    { icon: Eye, label: 'Observations', page: 'Observations' },
  ],
  manager: [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' },
    { icon: Shield, label: 'DUERP', page: 'DuerpWizard', readOnly: true },
    { icon: ClipboardList, label: 'Actions', page: 'ActionPlans' },
    { icon: Eye, label: 'Observations', page: 'Observations' },
  ],
  operator: [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' },
    { icon: Eye, label: 'Observations', page: 'Observations' },
  ],
  auditor: [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'Dashboard' },
    { icon: Shield, label: 'DUERP', page: 'DuerpWizard', readOnly: true },
    { icon: History, label: 'Historique', page: 'DuerpHistory' },
  ],
};

export default function Sidebar({ userRole = 'operator', collapsed, setCollapsed }) {
  const location = useLocation();
  const menuItems = roleMenuItems[userRole] || roleMenuItems.operator;

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 z-40 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center border-b border-slate-700 px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm">DUERP AI</h1>
                <p className="text-[10px] text-slate-400">Évaluation des risques</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.page);
            
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")} />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {!collapsed && item.readOnly && (
                  <Badge variant="outline" className="ml-auto text-[10px] border-slate-500 text-slate-400">
                    Lecture
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button */}
        <div className="p-2 border-t border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
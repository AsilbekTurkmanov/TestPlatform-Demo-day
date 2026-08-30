import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  History,
  BarChart3,
  Users,
  FolderTree,
  ShieldCheck,
  PlusCircle,
  HelpCircle,
  Settings,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/I18nContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (!user) return null;

  const studentNavItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/exams', label: t('nav.catalog'), icon: BookOpen },
    { to: '/history', label: t('nav.history'), icon: History },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart3 },
  ];

  const teacherNavItems = [
    { to: '/teacher/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/teacher/exams', label: t('nav.manageExams'), icon: BookOpen },
    { to: '/teacher/exams/new', label: t('teacher.createExam'), icon: PlusCircle },
    { to: '/teacher/analytics', label: t('nav.analytics'), icon: BarChart3 },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/admin/users', label: t('nav.users'), icon: Users },
    { to: '/admin/categories', label: t('nav.categories'), icon: FolderTree },
    { to: '/admin/exams', label: t('admin.examModeration'), icon: ShieldCheck },
    { to: '/admin/analytics', label: t('nav.analytics'), icon: BarChart3 },
  ];

  const navItems =
    user.role === UserRole.Admin
      ? adminNavItems
      : user.role === UserRole.Teacher
      ? teacherNavItems
      : studentNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-50 w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile close header */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {user.role === UserRole.Admin ? t('common.admin') : user.role === UserRole.Teacher ? t('common.teacher') : t('common.student')}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Support / Help */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
          <NavLink
            to="/settings"
            onClick={() => onClose()}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>{t('common.settings')}</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

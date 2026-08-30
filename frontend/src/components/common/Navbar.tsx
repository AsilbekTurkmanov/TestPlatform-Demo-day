import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sun,
  Moon,
  Laptop,
  Globe,
  LogOut,
  User as UserIcon,
  Settings,
  Menu,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme, Theme } from '../../theme/ThemeContext';
import { useTranslation, Language } from '../../i18n/I18nContext';
import { UserRole } from '../../types';
import { Badge } from './Badge';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, login, isAuthenticated } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const navigate = useNavigate();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) setLangMenuOpen(false);
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) setThemeMenuOpen(false);
      if (userRef.current && !userRef.current.contains(event.target as Node)) setUserMenuOpen(false);
      if (demoRef.current && !demoRef.current.contains(event.target as Node)) setDemoMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleQuickLogin = async (email: string, pass: string) => {
    try {
      const auth = await login(email, pass);
      setDemoMenuOpen(false);
      if (auth.role === UserRole.Admin) {
        navigate('/admin/dashboard');
      } else if (auth.role === UserRole.Teacher) {
        navigate('/teacher/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        return <Badge variant="danger" size="sm">{t('common.admin')}</Badge>;
      case UserRole.Teacher:
        return <Badge variant="purple" size="sm">{t('common.teacher')}</Badge>;
      default:
        return <Badge variant="primary" size="sm">{t('common.student')}</Badge>;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Brand & Hamburger */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                TestPlatform
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 -mt-1 hidden sm:block">
                EdTech Assessment
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: Language, Theme, Quick Demo, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher */}
          <div className="relative" ref={demoRef}>
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/40 hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>Demo</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t('auth.demoAccounts')}
                </div>
                <button
                  onClick={() => handleQuickLogin('admin@testplatform.uz', 'Admin123!')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="font-semibold">Admin</div>
                    <div className="text-[10px] text-slate-400">admin@testplatform.uz</div>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickLogin('teacher@testplatform.uz', 'Teacher123!')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="font-semibold">Teacher (O'qituvchi)</div>
                    <div className="text-[10px] text-slate-400">teacher@testplatform.uz</div>
                  </div>
                </button>
                <button
                  onClick={() => handleQuickLogin('student@testplatform.uz', 'Student123!')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-semibold">Student (Jasur)</div>
                    <div className="text-[10px] text-slate-400">student@testplatform.uz</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              aria-label="Select language"
            >
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="uppercase">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => { setLanguage('uz'); setLangMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-left transition-colors ${language === 'uz' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span>🇺🇿</span>
                  <span>O'zbekcha</span>
                </button>
                <button
                  onClick={() => { setLanguage('ru'); setLangMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-left transition-colors ${language === 'ru' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span>🇷🇺</span>
                  <span>Русский</span>
                </button>
                <button
                  onClick={() => { setLanguage('en'); setLangMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-left transition-colors ${language === 'en' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span>🇬🇧</span>
                  <span>English</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Laptop className="w-4 h-4 text-slate-500" />}
            </button>

            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-left transition-colors ${theme === 'light' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('common.light')}</span>
                </button>
                <button
                  onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-left transition-colors ${theme === 'dark' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('common.dark')}</span>
                </button>
                <button
                  onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-left transition-colors ${theme === 'system' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('common.system')}</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile / Auth State */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=3B82F6&color=fff`}
                  alt={user.fullName}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover ring-2 ring-blue-500/20"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {user.role === UserRole.Admin ? t('common.admin') : user.role === UserRole.Teacher ? t('common.teacher') : t('common.student')}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate mb-1.5">{user.email}</p>
                    {getRoleBadge(user.role)}
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-blue-500" />
                    <span>{t('common.profile')}</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>{t('common.settings')}</span>
                  </Link>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800/80" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('common.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t('common.login')}
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
              >
                {t('common.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

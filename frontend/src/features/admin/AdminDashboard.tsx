import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  ShieldCheck,
  FolderTree,
  BookOpen,
  TrendingUp,
  Award,
  PlusCircle,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { analyticsApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['adminAnalyticsDashboard'],
    queryFn: () => analyticsApi.getAdminAnalytics(),
  });

  const data = analyticsRes?.data;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('admin.dashboardTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Platforma foydalanuvchilari, testlar monitoringi va global ko'rsatkichlar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/users')}
            leftIcon={<Users className="w-4 h-4" />}
            className="font-bold shadow-md shadow-blue-500/20"
          >
            {t('admin.userManagement')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/categories')}
            leftIcon={<FolderTree className="w-4 h-4" />}
            className="font-bold"
          >
            {t('admin.categoryManagement')}
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('admin.totalUsers')}</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {data?.totalUsers ?? 0}
            </div>
          )}
          <p className="text-[11px] text-slate-500">
            {data?.totalStudents ?? 0} talaba • {data?.totalTeachers ?? 0} o'qituvchi
          </p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Jami Testlar</span>
            <BookOpen className="w-5 h-5 text-purple-500" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {data?.totalExams ?? 0}
            </div>
          )}
          <p className="text-[11px] text-slate-500">Barcha kategoriyalar bo'yicha</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Jami Urinishlar</span>
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {data?.totalAttempts ?? 0}
            </div>
          )}
          <p className="text-[11px] text-slate-500">
            {data?.completedAttempts ?? 0} tasi yakunlangan
          </p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('admin.platformPassRate')}</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {data?.platformPassRate ?? 0}%
            </div>
          )}
          <p className="text-[11px] text-slate-500">Platforma o'rtacha: {data?.platformAverageScore ?? 0}%</p>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card
          hoverEffect
          className="p-6 cursor-pointer border-slate-200/80 dark:border-slate-800/80"
          onClick={() => navigate('/admin/users')}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{t('admin.userManagement')}</h3>
          <p className="text-xs text-slate-500 mt-1">Foydalanuvchilarni faollashtirish, rollarni o'zgartirish va boshqarish</p>
        </Card>

        <Card
          hoverEffect
          className="p-6 cursor-pointer border-slate-200/80 dark:border-slate-800/80"
          onClick={() => navigate('/admin/categories')}
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-4">
            <FolderTree className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{t('admin.categoryManagement')}</h3>
          <p className="text-xs text-slate-500 mt-1">Ko'p tilli kategoriyalar, ranglar va piktogrammalarni sozlash</p>
        </Card>

        <Card
          hoverEffect
          className="p-6 cursor-pointer border-slate-200/80 dark:border-slate-800/80"
          onClick={() => navigate('/admin/exams')}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{t('admin.examModeration')}</h3>
          <p className="text-xs text-slate-500 mt-1">Platformadagi barcha testlarni moderatsiya qilish va nazorat</p>
        </Card>
      </div>
    </div>
  );
};

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Activity,
} from 'lucide-react';
import { analyticsApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['adminAnalyticsFull'],
    queryFn: () => analyticsApi.getAdminAnalytics(),
  });

  const data = analyticsRes?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  if (!data) {
    return <EmptyState title={t('common.noData')} description="Platforma statistikasi mavjud emas" />;
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Platforma Tahlili & Monitoring
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Foydalanuvchilar o'sishi, imtihon faolligi va tizim umumiy salomatligi
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">{t('admin.totalUsers')}</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            {data.totalUsers}
          </div>
          <p className="text-[11px] text-slate-500">{data.totalStudents} talaba • {data.totalTeachers} o'qituvchi</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Jami Testlar</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
            {data.totalExams}
          </div>
          <p className="text-[11px] text-slate-500">Platformadagi barcha testlar</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Jami Urinishlar</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {data.totalAttempts}
          </div>
          <p className="text-[11px] text-slate-500">{data.completedAttempts} tasi yakunlangan</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">{t('admin.platformPassRate')}</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {data.platformPassRate}%
          </div>
          <p className="text-[11px] text-slate-500">O'rtacha ball: {data.platformAverageScore}%</p>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <CardHeader className="p-6">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-slate-100">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{t('admin.userGrowth')}</span>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {data.userGrowth.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={3} name="Talabalar" />
                  <Line type="monotone" dataKey="teachers" stroke="#8B5CF6" strokeWidth={3} name="O'qituvchilar" />
                  <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={3} name="Jami" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Ma'lumotlar topilmadi" />
          )}
        </CardBody>
      </Card>

      {/* Exam Activity Bar Chart */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <CardHeader className="p-6">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-slate-100">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>{t('admin.examActivity')}</span>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {data.examActivity.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.examActivity}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="attempts" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Boshlangan testlar" />
                  <Bar dataKey="completed" fill="#10B981" radius={[8, 8, 0, 0]} name="Tugallangan testlar" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Ma'lumotlar topilmadi" />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

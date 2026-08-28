import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Zap,
  Target,
  Clock,
  Sparkles,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react';
import { analyticsApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const StudentAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['studentDetailedAnalytics'],
    queryFn: () => analyticsApi.getStudentAnalytics(),
  });

  const data = analyticsRes?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
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
    return <EmptyState title={t('common.noData')} description="Tahlil ma'lumotlari mavjud emas." />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('nav.analytics')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Shaxsiy bilim ko'rsatkichlari, kuchli va rivojlantirish kerak bo'lgan yo'nalishlar
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">{t('student.statsExamsTaken')}</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            {data.totalExamsTaken}
          </div>
          <p className="text-[11px] text-slate-500">{data.completedExams} marta topshirilgan</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">{t('student.statsAvgScore')}</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {data.averageScore}%
          </div>
          <p className="text-[11px] text-slate-500">Umumiy o'rtacha natija</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">{t('student.strongestArea')}</span>
          <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 truncate">
            {data.strongestCategory}
          </div>
          <p className="text-[11px] text-slate-500">Eng yuqori ball to'plangan</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">{t('student.weakestArea')}</span>
          <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 truncate">
            {data.weakestCategory}
          </div>
          <p className="text-[11px] text-slate-500">Qo'shimcha mashq tavsiya etiladi</p>
        </Card>
      </div>

      {/* Score Progression Chart */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <CardHeader className="p-6">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-slate-100">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>{t('student.scoreProgression')}</span>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {data.scoreHistory.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.scoreHistory}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreColor)"
                    name="Natija (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Tarixiy natijalar mavjud emas" />
          )}
        </CardBody>
      </Card>

      {/* Category Performance Bar Chart */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <CardHeader className="p-6">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-slate-100">
            <Target className="w-5 h-5 text-purple-600" />
            <span>{t('student.categoryMastery')}</span>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {data.categoryPerformance.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="categoryName" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
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
                  <Bar dataKey="averageScore" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="O'rtacha ball (%)" />
                  <Bar dataKey="passRate" fill="#10B981" radius={[8, 8, 0, 0]} name="O'tish darajasi (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Kategoriya bo'yicha ma'lumotlar mavjud emas" />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

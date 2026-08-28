import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Award,
  Users,
  BookOpen,
} from 'lucide-react';
import { analyticsApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const TeacherAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['teacherDetailedAnalytics'],
    queryFn: () => analyticsApi.getTeacherAnalytics(),
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
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('nav.analytics')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          O'qituvchi testlari ko'rsatkichlari, eng ko'p xato qilingan savollar va ballar taqsimoti
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">{t('teacher.totalCreatedExams')}</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            {data.totalExamsCreated}
          </div>
          <p className="text-[11px] text-slate-500">{data.publishedExams} ta nashr qilingan</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">{t('teacher.totalParticipants')}</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
            {data.totalStudentAttempts}
          </div>
          <p className="text-[11px] text-slate-500">Talabalar topshirishlari</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">{t('teacher.averageStudentScore')}</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {data.overallAverageScore}%
          </div>
          <p className="text-[11px] text-slate-500">O'rtacha ball</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-400">{t('teacher.overallPassRate')}</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {data.overallPassRate}%
          </div>
          <p className="text-[11px] text-slate-500">O'tish darajasi</p>
        </Card>
      </div>

      {/* Score Distribution Chart */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <CardHeader className="p-6">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-slate-100">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>{t('teacher.scoreDistribution')}</span>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          {data.scoreDistribution.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
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
                  <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Talabalar soni" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="Taqsimot ma'lumotlari mavjud emas" />
          )}
        </CardBody>
      </Card>

      {/* Most Missed Questions */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden">
        <CardHeader className="p-6">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-slate-100">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>{t('teacher.mostMissedQuestions')}</span>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          {data.mostMissedQuestions.length > 0 ? (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-5">Savol matni</th>
                  <th className="py-3.5 px-5">Test</th>
                  <th className="py-3.5 px-5">Javoblar</th>
                  <th className="py-3.5 px-5">Xatolar</th>
                  <th className="py-3.5 px-5 text-right">Xatolik foizi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {data.mostMissedQuestions.map((q) => (
                  <tr key={q.questionId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-slate-100 max-w-md truncate">
                      {q.questionText}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {q.examTitle}
                    </td>
                    <td className="py-4 px-5 text-slate-700 dark:text-slate-300">
                      {q.totalAnswers} ta
                    </td>
                    <td className="py-4 px-5 text-red-600 font-bold">
                      {q.incorrectAnswers} ta
                    </td>
                    <td className="py-4 px-5 text-right font-black text-red-600">
                      {q.missRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Hozircha xato qilingan savollar ro'yxati shakllanmagan.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

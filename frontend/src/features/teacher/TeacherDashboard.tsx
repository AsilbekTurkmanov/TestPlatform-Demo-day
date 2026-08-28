import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  PlusCircle,
  BarChart3,
  CheckCircle2,
  FileQuestion,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { analyticsApi, examApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ExamStatus } from '../../types';

export const TeacherDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: ['teacherAnalytics'],
    queryFn: () => analyticsApi.getTeacherAnalytics(),
  });

  const { data: teacherExamsRes, isLoading: examsLoading } = useQuery({
    queryKey: ['teacherMyExams'],
    queryFn: () => examApi.getTeacherExams(),
  });

  const analytics = analyticsRes?.data;
  const exams = teacherExamsRes?.data || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('teacher.dashboardTitle')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Testlar yaratish, talabalar natijalarini kuzatish va chuqur tahlillar
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/teacher/exams/new')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="font-bold shadow-md shadow-blue-500/20"
        >
          {t('teacher.createExam')}
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('teacher.totalCreatedExams')}</span>
            <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          {analyticsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {analytics?.totalExamsCreated ?? 0}
            </div>
          )}
          <p className="text-[11px] text-slate-500">
            {analytics?.publishedExams ?? 0} tasi e'lon qilingan
          </p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('teacher.totalParticipants')}</span>
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          {analyticsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {analytics?.totalStudentAttempts ?? 0}
            </div>
          )}
          <p className="text-[11px] text-slate-500">Jami topshirilgan urinishlar</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('teacher.averageStudentScore')}</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          {analyticsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {analytics?.overallAverageScore ?? 0}%
            </div>
          )}
          <p className="text-[11px] text-slate-500">Talabalar o'rtacha balli</p>
        </Card>

        <Card className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{t('teacher.overallPassRate')}</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          {analyticsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {analytics?.overallPassRate ?? 0}%
            </div>
          )}
          <p className="text-[11px] text-slate-500">Muvaffaqiyatli o'tganlar ulushi</p>
        </Card>
      </div>

      {/* My Exams Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('nav.manageExams')}
          </h2>
          <Link
            to="/teacher/exams"
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>{t('common.all')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {examsLoading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : exams.length > 0 ? (
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-3.5 px-5">Test Nomi</th>
                    <th className="py-3.5 px-5">Kategoriya</th>
                    <th className="py-3.5 px-5">Savollar</th>
                    <th className="py-3.5 px-5">Qatnashuvchilar</th>
                    <th className="py-3.5 px-5">Holat</th>
                    <th className="py-3.5 px-5 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {exams.slice(0, 5).map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-slate-100">
                        {exam.title}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: exam.categoryColor || '#3B82F6' }}
                        >
                          {exam.categoryName}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-700 dark:text-slate-300">
                        {exam.totalQuestions} ta
                      </td>
                      <td className="py-4 px-5 text-slate-700 dark:text-slate-300">
                        {exam.participantCount} ta
                      </td>
                      <td className="py-4 px-5">
                        {exam.status === ExamStatus.Published ? (
                          <Badge variant="success" size="sm" dot>{t('common.published')}</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">{t('common.draft')}</Badge>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/teacher/exams/${exam.id}/questions`)}
                          className="font-semibold text-xs"
                        >
                          {t('teacher.manageQuestions')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/teacher/exams/${exam.id}/participants`)}
                          className="font-semibold text-xs text-blue-600"
                        >
                          {t('nav.participants')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="Sizda hali testlar yo'q"
            description="Talabalaringiz bilimini tekshirish uchun birinchi testingizni yarating."
            actionText={t('teacher.createExam')}
            onAction={() => navigate('/teacher/exams/new')}
          />
        )}
      </div>
    </div>
  );
};

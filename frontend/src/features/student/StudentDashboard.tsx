import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Flame,
  ChevronRight,
  Play,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/I18nContext';
import { analyticsApi, examApi, attemptApi } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ExamDifficulty, AttemptStatus } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Queries
  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: ['studentAnalytics'],
    queryFn: () => analyticsApi.getStudentAnalytics(),
  });

  const { data: examsRes, isLoading: examsLoading } = useQuery({
    queryKey: ['recommendedExams'],
    queryFn: () => examApi.getExams({ pageSize: 4, sortBy: 'popular' }),
  });

  const { data: attemptsRes, isLoading: attemptsLoading } = useQuery({
    queryKey: ['myAttempts'],
    queryFn: () => attemptApi.getMyAttempts(),
  });

  const analytics = analyticsRes?.data;
  const recommendedExams = examsRes?.data?.items || [];
  const recentAttempts = (attemptsRes?.data || []).slice(0, 5);

  const getDifficultyBadge = (difficulty: ExamDifficulty) => {
    switch (difficulty) {
      case ExamDifficulty.Easy:
        return <Badge variant="success" size="sm">{t('common.easy')}</Badge>;
      case ExamDifficulty.Hard:
        return <Badge variant="danger" size="sm">{t('common.hard')}</Badge>;
      default:
        return <Badge variant="warning" size="sm">{t('common.medium')}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-10 text-white shadow-xl shadow-blue-500/10">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white/90">
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Faol O'rganish Mavsumi 2026</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t('student.heroTitle')}
          </h1>
          <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
            {t('student.heroSubtitle')}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/exams')}
              leftIcon={<BookOpen className="w-5 h-5 text-blue-600" />}
              className="bg-white hover:bg-slate-100 text-blue-600 font-bold shadow-md"
            >
              {t('student.exploreExams')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/history')}
              className="border-white/30 text-white hover:bg-white/10 font-semibold"
            >
              {t('student.myProgress')}
            </Button>
          </div>
        </div>
      </div>

      {/* Real Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Exams Taken */}
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-5 sm:p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('student.statsExamsTaken')}
              </p>
              {analyticsLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {analytics?.totalExamsTaken ?? 0}
                </h3>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Average Score */}
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-5 sm:p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('student.statsAvgScore')}
              </p>
              {analyticsLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {analytics?.averageScore ?? 0}%
                </h3>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Pass Rate */}
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-5 sm:p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('student.statsPassRate')}
              </p>
              {analyticsLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {analytics?.passRate ?? 0}%
                </h3>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Time Spent */}
        <Card className="hover:shadow-md transition-shadow">
          <CardBody className="p-5 sm:p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('student.statsTimeSpent')}
              </p>
              {analyticsLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {analytics?.totalTimeSpentMinutes ?? 0} {t('common.minutes')}
                </h3>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recommended Exams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('student.recommendedExams')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bilimingizni mustahkamlash uchun tanlangan testlar
            </p>
          </div>
          <Link
            to="/exams"
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>{t('common.all')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {examsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-56 w-full rounded-2xl" />
            ))}
          </div>
        ) : recommendedExams.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedExams.map((exam) => (
              <Card key={exam.id} hoverEffect className="flex flex-col justify-between">
                <CardBody className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: exam.categoryColor || '#3B82F6' }}
                    >
                      {exam.categoryName}
                    </span>
                    {getDifficultyBadge(exam.difficulty)}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {exam.description}
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{exam.durationMinutes} {t('common.minutes')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>{exam.passingScore}% {t('results.passingScore')}</span>
                    </div>
                  </div>
                </CardBody>

                <div className="p-4 pt-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full font-bold"
                    leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                    onClick={() => navigate(`/exams/${exam.id}`)}
                  >
                    {t('student.takeExam')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('common.noData')}
            description="Hozirda tavsiya etilgan testlar mavjud emas."
            actionText={t('student.exploreExams')}
            onAction={() => navigate('/exams')}
          />
        )}
      </div>

      {/* Recent Attempts Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('student.recentAttempts')}
          </h2>
          <Link
            to="/history"
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>{t('student.myProgress')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {attemptsLoading ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : recentAttempts.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-3 px-4">Test Nomi</th>
                    <th className="py-3 px-4">Kategoriya</th>
                    <th className="py-3 px-4">Natija</th>
                    <th className="py-3 px-4">Holat</th>
                    <th className="py-3 px-4">Sana</th>
                    <th className="py-3 px-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {recentAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {attempt.examTitle}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: attempt.categoryColor || '#3B82F6' }}
                        >
                          {attempt.categoryName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black">
                        <span className={attempt.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                          {attempt.percentage}% ({attempt.earnedPoints}/{attempt.totalPoints} {t('common.points')})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {attempt.passed ? (
                          <Badge variant="success" size="sm" dot>{t('results.passed')}</Badge>
                        ) : (
                          <Badge variant="danger" size="sm">{t('results.failed')}</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(attempt.startedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/results/${attempt.id}`)}
                          className="text-blue-600 dark:text-blue-400 font-bold"
                        >
                          {t('student.viewResult')}
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
            title={t('common.noData')}
            description="Siz hali hech qanday test topshirmagansiz."
            actionText={t('student.exploreExams')}
            onAction={() => navigate('/exams')}
          />
        )}
      </div>
    </div>
  );
};

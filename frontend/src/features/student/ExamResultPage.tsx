import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  Sparkles,
  BookOpen,
  Eye,
} from 'lucide-react';
import { resultApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';

export const ExamResultPage: React.FC = () => {
  const { id: attemptId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: resultRes, isLoading, error } = useQuery({
    queryKey: ['examResult', attemptId],
    queryFn: () => resultApi.getResultById(attemptId!),
    enabled: !!attemptId,
  });

  const result = resultRes?.data;

  // Trigger confetti burst on successful pass!
  useEffect(() => {
    if (result && result.passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [result]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-10">
        <Skeleton className="h-72 w-full rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Natija topilmadi</h2>
        <Button variant="outline" onClick={() => navigate('/exams')}>
          {t('student.exploreExams')}
        </Button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} daq ${secs} son`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Top Banner Card */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden text-center">
        <div
          className="h-3 w-full"
          style={{ backgroundColor: result.passed ? '#10B981' : '#EF4444' }}
        />

        <CardBody className="p-8 sm:p-12 space-y-6">
          {/* Badge & Icon */}
          <div className="flex justify-center">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-transform animate-bounce ${
                result.passed
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-red-500 text-white shadow-red-500/30'
              }`}
            >
              {result.passed ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
          </div>

          {/* Title & Status */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {result.passed ? t('results.passed') : t('results.failed')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {result.examTitle} ({result.categoryName})
            </p>
          </div>

          {/* Radial Score Circle Simulation */}
          <div className="flex items-center justify-center gap-8 py-4">
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                {result.percentage}%
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                {result.earnedPoints} / {result.totalPoints} {t('common.points')}
              </span>
            </div>

            <div className="h-14 w-[1px] bg-slate-200 dark:bg-slate-800" />

            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300">
                {result.passingScore}%
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                {t('results.passingScore')}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {t('results.correctAnswers')}
              </div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {result.correctAnswersCount} ta
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
              <div className="text-xs font-semibold text-red-700 dark:text-red-300">
                {t('results.incorrectAnswers')}
              </div>
              <div className="text-lg font-black text-red-600 dark:text-red-400 mt-0.5">
                {result.incorrectAnswersCount} ta
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('results.unanswered')}
              </div>
              <div className="text-lg font-black text-slate-700 dark:text-slate-300 mt-0.5">
                {result.unansweredCount} ta
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                {t('results.timeSpent')}
              </div>
              <div className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">
                {formatTime(result.timeSpentSeconds)}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/review/${result.attemptId}`)}
              leftIcon={<Eye className="w-4 h-4" />}
              className="w-full sm:w-auto font-black px-8 shadow-md shadow-blue-500/20"
            >
              {t('student.reviewAnswers')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/exams')}
              leftIcon={<BookOpen className="w-4 h-4" />}
              className="w-full sm:w-auto font-bold"
            >
              {t('results.backToDashboard')}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

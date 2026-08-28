import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Clock,
  Award,
  AlertTriangle,
  Play,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { examApi, attemptApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../components/common/Toast';
import { ExamDifficulty } from '../../types';

export const ExamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const [isStarting, setIsStarting] = useState(false);

  const { data: examRes, isLoading } = useQuery({
    queryKey: ['examDetail', id],
    queryFn: () => examApi.getExamById(id!),
    enabled: !!id,
  });

  const exam = examRes?.data;

  const handleStartExam = async () => {
    if (!exam) return;
    setIsStarting(true);
    try {
      const res = await attemptApi.startExam(exam.id);
      if (res.success && res.data) {
        navigate(`/take/${res.data.attemptId}`);
      }
    } catch (err: any) {
      toastError(err.message || 'Could not start exam.');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <Skeleton className="h-8 w-32 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Test topilmadi</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/exams')}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/exams')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('common.back')} {t('nav.catalog')}</span>
      </button>

      {/* Main Details Card */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-lg overflow-hidden">
        {/* Color Top Banner */}
        <div
          className="h-4 w-full"
          style={{ backgroundColor: exam.categoryColor || '#3B82F6' }}
        />

        <CardBody className="p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-xs font-bold px-3 py-1 rounded-lg text-white"
                style={{ backgroundColor: exam.categoryColor || '#3B82F6' }}
              >
                {exam.categoryName}
              </span>
              <Badge variant="primary" size="sm">
                {exam.difficulty === ExamDifficulty.Easy
                  ? t('common.easy')
                  : exam.difficulty === ExamDifficulty.Hard
                  ? t('common.hard')
                  : t('common.medium')}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {exam.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {exam.description}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400">{t('common.questions')}</span>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                {exam.totalQuestions} ta
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400">{t('teacher.durationMinutes')}</span>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{exam.durationMinutes} {t('common.minutes')}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400">{t('results.passingScore')}</span>
              <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>{exam.passingScore}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400">{t('student.attemptsLeft')}</span>
              <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400">
                {Math.max(0, exam.maxAttempts - exam.userAttemptsCount)} / {exam.maxAttempts}
              </div>
            </div>
          </div>

          {/* Rules & Guidelines */}
          <div className="p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-900 dark:text-blue-200">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Imtihon qoidalari va ko'rsatmalar</span>
            </div>
            <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Test boshlangach, server vaqt hisoblagichi avtomatik ishga tushadi.</li>
              <li>Har bir belgilangan javob avtomatik tarzda serverga saqlanadi (Autosave).</li>
              <li>Vaqt tugaganda test avtomatik yakunlanadi va natijangiz hisoblanadi.</li>
              <li>Kerakli savollarni keyinroq qayta tekshirish uchun belgilab qo'yishingiz mumkin.</li>
            </ul>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-black px-10 shadow-lg shadow-blue-500/20 text-base"
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              isLoading={isStarting}
              onClick={handleStartExam}
            >
              {exam.hasUserAttempted ? t('student.retakeExam') : t('student.takeExam')}
            </Button>
            <span className="text-xs text-slate-400 font-medium">
              O'qituvchi: <strong className="text-slate-700 dark:text-slate-200">{exam.teacherName}</strong>
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

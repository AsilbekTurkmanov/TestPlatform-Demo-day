import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Code2,
  HelpCircle,
  Check,
  X,
} from 'lucide-react';
import { resultApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { QuestionType } from '../../types';

export const AnswerReviewPage: React.FC = () => {
  const { id: attemptId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: resultRes, isLoading, error } = useQuery({
    queryKey: ['answerReview', attemptId],
    queryFn: () => resultApi.getResultById(attemptId!),
    enabled: !!attemptId,
  });

  const result = resultRes?.data;
  const reviews = result?.questionReviews || [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/results/${attemptId}`)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')} {t('results.yourScore')}</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge variant={result.passed ? 'success' : 'danger'} size="md">
            {result.percentage}% ({result.earnedPoints}/{result.totalPoints} {t('common.points')})
          </Badge>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('results.reviewAllQuestions')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {result.examTitle} — Har bir savol bo'yicha to'g'ri javoblar va yechimlar
        </p>
      </div>

      {/* Questions Breakdown List */}
      <div className="space-y-6">
        {reviews.map((q, idx) => {
          const isCorrect = q.isCorrect === true;
          const isUnanswered = !q.wasAnswered;

          return (
            <Card
              key={q.questionId}
              className={`rounded-3xl border-2 transition-all ${
                isCorrect
                  ? 'border-emerald-500/30 dark:border-emerald-500/20'
                  : isUnanswered
                  ? 'border-slate-300 dark:border-slate-700'
                  : 'border-red-500/30 dark:border-red-500/20'
              }`}
            >
              <CardBody className="p-6 sm:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-xs">
                      {t('examTaking.question')} {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {q.earnedPoints} / {q.points} {t('common.points')}
                    </span>
                  </div>

                  <div>
                    {isCorrect ? (
                      <Badge variant="success" size="sm" dot>To'g'ri</Badge>
                    ) : isUnanswered ? (
                      <Badge variant="secondary" size="sm">Javob berilmadi</Badge>
                    ) : (
                      <Badge variant="danger" size="sm" dot>Noto'g'ri</Badge>
                    )}
                  </div>
                </div>

                {/* Prompt Text */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {q.text}
                  </h3>

                  {q.codeSnippet && (
                    <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                      <pre className="whitespace-pre">{q.codeSnippet}</pre>
                    </div>
                  )}
                </div>

                {/* Options Review */}
                <div className="space-y-2.5">
                  {q.options.map((opt) => {
                    let optClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';

                    if (opt.isCorrect && opt.isSelected) {
                      optClass = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold';
                    } else if (opt.isCorrect && !opt.isSelected) {
                      optClass = 'border-emerald-500 border-dashed bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-semibold';
                    } else if (!opt.isCorrect && opt.isSelected) {
                      optClass = 'border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-950 dark:text-red-200 font-semibold';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 text-xs sm:text-sm ${optClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              opt.isCorrect
                                ? 'bg-emerald-600 text-white'
                                : opt.isSelected
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                            }`}
                          >
                            {opt.isCorrect ? <Check className="w-3.5 h-3.5" /> : opt.isSelected ? <X className="w-3.5 h-3.5" /> : '•'}
                          </div>
                          <span>{opt.text}</span>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {opt.isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {t('results.yourAnswer')}
                            </span>
                          )}
                          {opt.isCorrect && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                              {t('results.correctAnswer')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Solution & Explanation Box */}
                {q.explanation && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                      <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{t('results.explanation')}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

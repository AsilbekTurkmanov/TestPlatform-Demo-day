import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Clock,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Code2,
  Check,
  Loader2,
} from 'lucide-react';
import { attemptApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../components/common/Toast';
import { QuestionType, AttemptStatus } from '../../types';

export const ExamTakingPage: React.FC = () => {
  const { id: attemptId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Attempt Details
  const { data: attemptRes, isLoading, error } = useQuery({
    queryKey: ['attemptTaking', attemptId],
    queryFn: () => attemptApi.getAttempt(attemptId!),
    enabled: !!attemptId,
    refetchOnWindowFocus: false,
  });

  const attempt = attemptRes?.data;
  const questions = attempt?.questions || [];
  const currentQuestion = questions[currentIndex];

  // Initialize saved answers and flags from server
  useEffect(() => {
    if (attempt) {
      if (attempt.status === AttemptStatus.Completed || attempt.status === AttemptStatus.Expired) {
        navigate(`/results/${attempt.attemptId}`);
        return;
      }

      const answersMap: Record<string, string[]> = {};
      const markedMap: Record<string, boolean> = {};

      attempt.savedAnswers.forEach((ans) => {
        answersMap[ans.questionId] = ans.selectedOptionIds;
        if (ans.isMarkedForReview) {
          markedMap[ans.questionId] = true;
        }
      });

      setSelectedAnswers(answersMap);
      setMarkedQuestions(markedMap);

      // Server-synced timer calculation
      const serverExpires = new Date(attempt.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((serverExpires - now) / 1000));
      setSecondsRemaining(remaining);
    }
  }, [attempt, navigate]);

  // Countdown Timer
  useEffect(() => {
    if (secondsRemaining === null) return;

    if (secondsRemaining <= 0) {
      handleFinalSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Answer selection handler (Radio or Checkbox based on QuestionType)
  const handleSelectOption = async (optionId: string) => {
    if (!currentQuestion || !attemptId) return;

    let newSelected: string[];

    if (currentQuestion.questionType === QuestionType.MultipleChoice) {
      const current = selectedAnswers[currentQuestion.id] || [];
      if (current.includes(optionId)) {
        newSelected = current.filter((id) => id !== optionId);
      } else {
        newSelected = [...current, optionId];
      }
    } else {
      // SingleChoice or TrueFalse
      newSelected = [optionId];
    }

    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: newSelected }));

    // Instant Autosave
    setIsAutoSaving(true);
    try {
      await attemptApi.saveAnswer(attemptId, {
        questionId: currentQuestion.id,
        selectedOptionIds: newSelected,
        isMarkedForReview: !!markedQuestions[currentQuestion.id],
      });
    } catch (err) {
      console.error('Autosave error:', err);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Toggle Mark for review
  const handleToggleMark = async () => {
    if (!currentQuestion || !attemptId) return;

    const newMarked = !markedQuestions[currentQuestion.id];
    setMarkedQuestions((prev) => ({ ...prev, [currentQuestion.id]: newMarked }));

    try {
      await attemptApi.saveAnswer(attemptId, {
        questionId: currentQuestion.id,
        selectedOptionIds: selectedAnswers[currentQuestion.id] || [],
        isMarkedForReview: newMarked,
      });
    } catch (err) {
      console.error('Save mark error:', err);
    }
  };

  // Submit Exam
  const handleFinalSubmit = async (isAutoExpired: boolean = false) => {
    if (!attemptId) return;
    setIsSubmitting(true);
    setIsSubmitModalOpen(false);

    try {
      const res = await attemptApi.submitExam(attemptId);
      if (res.success) {
        if (isAutoExpired) {
          toastWarning(t('examTaking.timeExpiredTitle'));
        } else {
          toastSuccess(t('results.examCompleted'));
        }
        navigate(`/results/${attemptId}`);
      }
    } catch (err: any) {
      toastError(err.message || 'Error submitting exam.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Imtihonga ulanishda xatolik</h2>
        <Button variant="primary" onClick={() => navigate('/exams')}>
          {t('student.exploreExams')}
        </Button>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).filter(
    (k) => (selectedAnswers[k] || []).length > 0
  ).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Sticky Test Bar */}
      <div className="sticky top-18 z-30 flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {attempt.categoryName}
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
            {attempt.examTitle}
          </h2>
        </div>

        {/* Real-time Server Sync Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-sm sm:text-base border shadow-xs transition-colors ${
              secondsRemaining !== null && secondsRemaining < 300
                ? 'bg-red-50 dark:bg-red-950/60 border-red-500/50 text-red-600 dark:text-red-400 animate-pulse'
                : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{secondsRemaining !== null ? formatTimer(secondsRemaining) : '--:--'}</span>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsSubmitModalOpen(true)}
            isLoading={isSubmitting}
            className="font-bold shadow-xs"
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            {t('examTaking.submitExam')}
          </Button>
        </div>
      </div>

      {/* Main Runner Grid (Question Area + Question Palette) */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Question Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
            <CardBody className="p-6 sm:p-8 space-y-6">
              {/* Question Header Info */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs">
                    {t('examTaking.question')} {currentIndex + 1} / {questions.length}
                  </span>
                  <Badge variant="secondary" size="sm">
                    {currentQuestion?.points} {t('common.points')}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  {/* Autosave feedback */}
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    {isAutoSaving ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                        <span>{t('examTaking.saving')}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>{t('examTaking.saved')}</span>
                      </>
                    )}
                  </span>

                  {/* Mark for review toggle */}
                  <button
                    onClick={handleToggleMark}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      markedQuestions[currentQuestion?.id || '']
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${markedQuestions[currentQuestion?.id || ''] ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">
                      {markedQuestions[currentQuestion?.id || ''] ? t('examTaking.marked') : t('examTaking.markForReview')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Question Prompt */}
              {currentQuestion && (
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {currentQuestion.text}
                  </h3>

                  {/* Code Snippet Box if available */}
                  {currentQuestion.codeSnippet && (
                    <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-500 pb-2 border-b border-slate-800 mb-2">
                        <Code2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Code Snippet</span>
                      </div>
                      <pre className="whitespace-pre">{currentQuestion.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Question Type Instruction */}
                  <p className="text-xs font-semibold text-slate-400">
                    {currentQuestion.questionType === QuestionType.MultipleChoice
                      ? t('examTaking.selectMultiple')
                      : t('examTaking.selectOption')}
                  </p>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-1">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = (selectedAnswers[currentQuestion.id] || []).includes(option.id);
                      const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

                      return (
                        <div
                          key={option.id}
                          onClick={() => handleSelectOption(option.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 select-none ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-slate-900 dark:text-slate-100 shadow-sm shadow-blue-500/10'
                              : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {optionLetters[idx] || idx + 1}
                          </div>
                          <span className="text-sm font-medium leading-relaxed">{option.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardBody>

            {/* Bottom Question Navigation */}
            <CardFooter className="p-4 sm:p-6 flex items-center justify-between">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                {t('common.previous')}
              </Button>

              <span className="text-xs font-bold text-slate-400">
                {currentIndex + 1} / {questions.length}
              </span>

              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  {t('common.next')}
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="md"
                  onClick={() => setIsSubmitModalOpen(true)}
                  rightIcon={<Send className="w-4 h-4" />}
                  className="font-bold"
                >
                  {t('examTaking.submitExam')}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Question Palette Sidebar (1 Col) */}
        <div className="space-y-4">
          <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
            <CardBody className="p-5 sm:p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Savollar xaritasi ({answeredCount}/{questions.length})
              </h4>

              {/* Palette Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = (selectedAnswers[q.id] || []).length > 0;
                  const isMarked = !!markedQuestions[q.id];
                  const isCurrent = idx === currentIndex;

                  let styleClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                  if (isMarked) {
                    styleClass = 'bg-amber-500 text-white font-black shadow-xs';
                  } else if (isAnswered) {
                    styleClass = 'bg-emerald-600 text-white font-black shadow-xs';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${styleClass} ${
                        isCurrent ? 'ring-3 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 z-10' : 'hover:opacity-90'
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isMarked && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full border border-white dark:border-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-600" />
                  <span className="text-slate-600 dark:text-slate-400">{t('examTaking.answered')} ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-500" />
                  <span className="text-slate-600 dark:text-slate-400">{t('examTaking.marked')} ({Object.keys(markedQuestions).filter(k => markedQuestions[k]).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-800" />
                  <span className="text-slate-600 dark:text-slate-400">{t('examTaking.unanswered')} ({unansweredCount})</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={t('examTaking.submitConfirmTitle')}
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t('examTaking.submitConfirmDesc')}
          </p>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400 font-semibold">{t('examTaking.answered')}</span>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {answeredCount} ta
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold">{t('examTaking.unanswered')}</span>
              <div className="text-lg font-black text-red-600 dark:text-red-400">
                {unansweredCount} ta
              </div>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{t('examTaking.unansweredWarning')}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsSubmitModalOpen(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleFinalSubmit(false)}
              isLoading={isSubmitting}
              className="font-bold shadow-md shadow-blue-500/20"
            >
              {t('examTaking.submitExam')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

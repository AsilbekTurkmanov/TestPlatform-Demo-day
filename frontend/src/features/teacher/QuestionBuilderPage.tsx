import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusCircle,
  ArrowLeft,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  Check,
  X,
  Code2,
  FileQuestion,
  HelpCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { examApi, questionApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { Question, QuestionOption, QuestionType } from '../../types';

interface OptionDraft {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export const QuestionBuilderPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  // Form State
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.SingleChoice);
  const [points, setPoints] = useState(10);
  const [explanation, setExplanation] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [options, setOptions] = useState<OptionDraft[]>([
    { text: '', isCorrect: true, order: 1 },
    { text: '', isCorrect: false, order: 2 },
    { text: '', isCorrect: false, order: 3 },
    { text: '', isCorrect: false, order: 4 },
  ]);

  // Fetch Exam Details
  const { data: examRes } = useQuery({
    queryKey: ['examDetail', examId],
    queryFn: () => examApi.getExamById(examId!),
    enabled: !!examId,
  });

  // Fetch Questions
  const { data: questionsRes, isLoading } = useQuery({
    queryKey: ['examQuestions', examId],
    queryFn: () => questionApi.getExamQuestions(examId!),
    enabled: !!examId,
  });

  const exam = examRes?.data;
  const questions = questionsRes?.data || [];

  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setQuestionType(QuestionType.SingleChoice);
    setPoints(10);
    setExplanation('');
    setCodeSnippet('');
    setOptions([
      { text: '', isCorrect: true, order: 1 },
      { text: '', isCorrect: false, order: 2 },
      { text: '', isCorrect: false, order: 3 },
      { text: '', isCorrect: false, order: 4 },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setQuestionText(q.text);
    setQuestionType(q.questionType);
    setPoints(q.points);
    setExplanation(q.explanation || '');
    setCodeSnippet(q.codeSnippet || '');
    setOptions(
      q.options.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
        order: o.order,
      }))
    );
    setIsModalOpen(true);
  };

  // Option actions
  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index].text = text;
      return updated;
    });
  };

  const handleToggleCorrect = (index: number) => {
    setOptions((prev) => {
      if (questionType === QuestionType.MultipleChoice) {
        return prev.map((opt, idx) => (idx === index ? { ...opt, isCorrect: !opt.isCorrect } : opt));
      } else {
        // Single or TrueFalse: only one correct
        return prev.map((opt, idx) => ({ ...opt, isCorrect: idx === index }));
      }
    });
  };

  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      { text: '', isCorrect: false, order: prev.length + 1 },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      toastError('Kamida 2 ta variant bo\'lishi shart');
      return;
    }
    setOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!examId) return;

      const hasCorrect = options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        throw new Error('Kamida bitta to\'g\'ri javob belgilanishi shart!');
      }

      const emptyOptions = options.some((o) => !o.text.trim());
      if (emptyOptions) {
        throw new Error('Barcha variant matnlarini to\'ldiring!');
      }

      const payload = {
        text: questionText,
        questionType,
        points: Number(points),
        explanation: explanation || undefined,
        codeSnippet: codeSnippet || undefined,
        options: options.map((o, idx) => ({
          id: o.id,
          text: o.text,
          isCorrect: o.isCorrect,
          order: idx + 1,
        })),
      };

      if (editingQuestion) {
        return questionApi.updateQuestion(editingQuestion.id, {
          ...payload,
          order: editingQuestion.order,
        });
      } else {
        return questionApi.createQuestion(examId, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['examDetail', examId] });
      queryClient.invalidateQueries({ queryKey: ['teacherExamsList'] });
      setIsModalOpen(false);
      toastSuccess(editingQuestion ? 'Savol yangilandi!' : 'Yangi savol qo\'shildi!');
    },
    onError: (err: any) => {
      toastError(err.message || 'Xatolik yuz berdi');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examQuestions', examId] });
      queryClient.invalidateQueries({ queryKey: ['examDetail', examId] });
      queryClient.invalidateQueries({ queryKey: ['teacherExamsList'] });
      setDeleteQuestionId(null);
      toastSuccess('Savol o\'chirildi');
    },
    onError: (err: any) => {
      toastError(err.message || 'O\'chirishda xatolik');
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/teacher/exams')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')} {t('nav.manageExams')}</span>
        </button>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="font-bold shadow-md shadow-blue-500/20"
        >
          {t('teacher.addQuestion')}
        </Button>
      </div>

      {/* Exam Summary Banner */}
      {exam && (
        <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-md text-white"
              style={{ backgroundColor: exam.categoryColor || '#3B82F6' }}
            >
              {exam.categoryName}
            </span>
            <h2 className="text-xl font-bold">{exam.title}</h2>
            <p className="text-xs text-slate-400">Jami savollar: {questions.length} ta • Jami ball: {questions.reduce((acc, q) => acc + q.points, 0)} ball</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}
            leftIcon={<Edit className="w-3.5 h-3.5" />}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 self-start sm:self-center"
          >
            Tafsilotlarni tahrirlash
          </Button>
        </div>
      )}

      {/* Questions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id} className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <CardBody className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <Badge variant="secondary" size="sm">
                      {q.points} {t('common.points')}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {q.questionType === QuestionType.MultipleChoice
                        ? t('examTaking.multipleChoice')
                        : q.questionType === QuestionType.TrueFalse
                        ? t('examTaking.trueFalse')
                        : t('examTaking.singleChoice')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(q)}
                      className="text-xs text-blue-600 dark:text-blue-400"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteQuestionId(q.id)}
                      className="text-xs text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    {q.text}
                  </p>

                  {q.codeSnippet && (
                    <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
                      <pre>{q.codeSnippet}</pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                          opt.isCorrect
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-950 dark:text-emerald-300 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-slate-200 dark:bg-slate-800">
                            {opt.isCorrect ? <Check className="w-3 h-3 text-emerald-600" /> : '•'}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {opt.isCorrect && (
                          <span className="text-[10px] text-emerald-600 font-bold">To'g'ri</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Savollar mavjud emas"
          description="Ushbu testga hali savollar qo'shilmagan. Birinchi savolni yarating!"
          actionText={t('teacher.addQuestion')}
          onAction={openCreateModal}
        />
      )}

      {/* Question Editor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Savolni tahrirlash' : t('teacher.addQuestion')}
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4 max-h-[75vh] overflow-y-auto pr-1"
        >
          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('teacher.questionText')}
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={2}
              required
              placeholder="Savol matnini kiriting..."
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type and Points */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t('teacher.questionType')}
              </label>
              <select
                value={questionType}
                onChange={(e) => {
                  const newType = Number(e.target.value) as QuestionType;
                  setQuestionType(newType);
                  if (newType === QuestionType.TrueFalse) {
                    setOptions([
                      { text: 'Rost (True)', isCorrect: true, order: 1 },
                      { text: 'Yolg\'on (False)', isCorrect: false, order: 2 },
                    ]);
                  }
                }}
                className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm p-2.5"
              >
                <option value={QuestionType.SingleChoice}>{t('examTaking.singleChoice')}</option>
                <option value={QuestionType.MultipleChoice}>{t('examTaking.multipleChoice')}</option>
                <option value={QuestionType.TrueFalse}>{t('examTaking.trueFalse')}</option>
              </select>
            </div>

            <Input
              label={t('teacher.questionPoints')}
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              required
            />
          </div>

          {/* Code Snippet Optional */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('teacher.codeSnippet')}
            </label>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              rows={2}
              placeholder="// Ixtiyoriy kod bloki..."
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs p-3"
            />
          </div>

          {/* Options Manager */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t('teacher.options')} (Kamida 1 ta to'g'ri variantni belgilang)
              </label>
              {questionType !== QuestionType.TrueFalse && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddOption}
                  className="text-xs font-bold text-blue-600"
                >
                  + {t('teacher.addOption')}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCorrect(idx)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                      opt.isCorrect
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 hover:text-emerald-500'
                    }`}
                    title={t('teacher.markCorrect')}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                    placeholder={`Variant ${idx + 1}...`}
                    required
                    className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {questionType !== QuestionType.TrueFalse && options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation Text */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('teacher.explanationText')}
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              placeholder="Talaba testni yakunlagach ko'rinadigan tushuntirish va yechim..."
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm p-3"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={saveMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
              className="font-bold shadow-md shadow-blue-500/20"
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Question Modal */}
      <Modal
        isOpen={!!deleteQuestionId}
        onClose={() => setDeleteQuestionId(null)}
        title="Savolni o'chirish"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Ushbu savolni o'chirib tashlamoqchimisiz?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteQuestionId(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteQuestionId && deleteMutation.mutate(deleteQuestionId)}
              isLoading={deleteMutation.isPending}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

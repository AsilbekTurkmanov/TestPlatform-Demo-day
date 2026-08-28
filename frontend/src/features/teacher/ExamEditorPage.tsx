import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft, BookOpen, Clock, Award, Shield, FileQuestion } from 'lucide-react';
import { examApi, categoryApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../components/common/Toast';
import { ExamDifficulty, ExamVisibility, ExamStatus } from '../../types';

export const ExamEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState<ExamDifficulty>(ExamDifficulty.Medium);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [visibility, setVisibility] = useState<ExamVisibility>(ExamVisibility.Public);
  const [status, setStatus] = useState<ExamStatus>(ExamStatus.Draft);

  // Fetch Categories
  const { data: categoriesRes } = useQuery({
    queryKey: ['categoriesAll'],
    queryFn: () => categoryApi.getCategories(true),
  });

  const categories = categoriesRes?.data || [];

  // Fetch Exam if editing
  const { data: examRes, isLoading: examLoading } = useQuery({
    queryKey: ['examEdit', id],
    queryFn: () => examApi.getExamById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (examRes?.data) {
      const e = examRes.data;
      setTitle(e.title);
      setDescription(e.description);
      setCategoryId(e.categoryId);
      setDifficulty(e.difficulty);
      setDurationMinutes(e.durationMinutes);
      setPassingScore(e.passingScore);
      setMaxAttempts(e.maxAttempts);
      setVisibility(e.visibility);
      setStatus(e.status);
    } else if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [examRes, categories]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        description,
        categoryId,
        difficulty,
        durationMinutes: Number(durationMinutes),
        passingScore: Number(passingScore),
        maxAttempts: Number(maxAttempts),
        visibility,
        status,
      };

      if (isEditing && id) {
        return examApi.updateExam(id, payload);
      } else {
        return examApi.createExam(payload);
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['teacherExamsList'] });
      toastSuccess(isEditing ? 'Test muvaffaqiyatli yangilandi' : 'Test muvaffaqiyatli yaratildi!');
      if (!isEditing && res.data?.id) {
        navigate(`/teacher/exams/${res.data.id}/questions`);
      } else {
        navigate('/teacher/exams');
      }
    },
    onError: (err: any) => {
      toastError(err.message || 'Saqlashda xatolik yuz berdi');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !categoryId) {
      toastError('Iltimos, barcha majburiy maydonlarni to\'ldiring');
      return;
    }
    saveMutation.mutate();
  };

  if (isEditing && examLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/teacher/exams')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')} {t('nav.manageExams')}</span>
        </button>

        {isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/teacher/exams/${id}/questions`)}
            leftIcon={<FileQuestion className="w-4 h-4" />}
            className="text-xs font-bold text-blue-600"
          >
            {t('teacher.manageQuestions')}
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {isEditing ? 'Testni tahrirlash' : t('teacher.createExam')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Test tafsilotlari, qoidalari va o'tish shartlarini belgilang
        </p>
      </div>

      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <CardBody className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('teacher.examTitle')}
              placeholder="Masalan: C# & .NET 10 Kengaytirilgan Imtihon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tavsif va ko'rsatmalar
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Test haqida qisqacha ma'lumot va ko'rsatmalar..."
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t('teacher.examCategory')}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameUz}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty, Duration, Passing Score, Max Attempts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('teacher.examDifficulty')}
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm p-3"
                >
                  <option value={ExamDifficulty.Easy}>{t('common.easy')}</option>
                  <option value={ExamDifficulty.Medium}>{t('common.medium')}</option>
                  <option value={ExamDifficulty.Hard}>{t('common.hard')}</option>
                </select>
              </div>

              {/* Duration Minutes */}
              <Input
                label={t('teacher.durationMinutes')}
                type="number"
                min={1}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
              />

              {/* Passing Score % */}
              <Input
                label={t('teacher.passingScore')}
                type="number"
                min={1}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                required
              />

              {/* Max Attempts */}
              <Input
                label={t('teacher.maxAttempts')}
                type="number"
                min={1}
                max={50}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                required
              />
            </div>

            {/* Visibility & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('teacher.visibility')}
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(Number(e.target.value))}
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm p-3"
                >
                  <option value={ExamVisibility.Public}>{t('common.public')}</option>
                  <option value={ExamVisibility.Private}>{t('common.private')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('common.status')}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(Number(e.target.value))}
                  className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm p-3"
                >
                  <option value={ExamStatus.Draft}>{t('common.draft')}</option>
                  <option value={ExamStatus.Published}>{t('common.published')}</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/teacher/exams')}
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
                {isEditing ? t('common.save') : 'Yaratish va Savollarga o\'tish'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

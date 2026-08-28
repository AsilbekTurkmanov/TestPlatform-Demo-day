import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, BookOpen, Clock, Award, Play, CheckCircle2 } from 'lucide-react';
import { examApi, categoryApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ExamDifficulty } from '../../types';

export const ExamCatalog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExamDifficulty | undefined>(undefined);

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories', true],
    queryFn: () => categoryApi.getCategories(true),
  });

  const { data: examsRes, isLoading } = useQuery({
    queryKey: ['examsCatalog', search, selectedCategory, selectedDifficulty],
    queryFn: () =>
      examApi.getExams({
        search: search || undefined,
        categoryId: selectedCategory,
        difficulty: selectedDifficulty,
        pageSize: 50,
      }),
  });

  const categories = categoriesRes?.data || [];
  const exams = examsRes?.data?.items || [];

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
    <div className="space-y-6 pb-12">
      {/* Catalog Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('nav.catalog')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mavzulashtirilgan bilim darajasi va professional sertifikatlash testlari
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative max-w-md w-full">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDifficulty(undefined)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              selectedDifficulty === undefined
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => setSelectedDifficulty(ExamDifficulty.Easy)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              selectedDifficulty === ExamDifficulty.Easy
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t('common.easy')}
          </button>
          <button
            onClick={() => setSelectedDifficulty(ExamDifficulty.Medium)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              selectedDifficulty === ExamDifficulty.Medium
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t('common.medium')}
          </button>
          <button
            onClick={() => setSelectedDifficulty(ExamDifficulty.Hard)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              selectedDifficulty === ExamDifficulty.Hard
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t('common.hard')}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedCategory === undefined
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          {t('common.all')} ({exams.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? undefined : cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: cat.color || '#3B82F6' }}
            />
            <span>{cat.nameUz}</span>
            <span className="opacity-70">({cat.examCount})</span>
          </button>
        ))}
      </div>

      {/* Exams Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : exams.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} hoverEffect className="flex flex-col justify-between">
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-lg text-white shadow-2xs"
                    style={{ backgroundColor: exam.categoryColor || '#3B82F6' }}
                  >
                    {exam.categoryName}
                  </span>
                  {getDifficultyBadge(exam.difficulty)}
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 line-clamp-2">
                    {exam.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                    {exam.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">{t('common.questions')}</div>
                    <div className="text-sm font-black text-slate-800 dark:text-slate-200">{exam.totalQuestions} ta</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">{t('teacher.durationMinutes')}</div>
                    <div className="text-sm font-black text-slate-800 dark:text-slate-200">{exam.durationMinutes} m</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold">{t('results.passingScore')}</div>
                    <div className="text-sm font-black text-slate-800 dark:text-slate-200">{exam.passingScore}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>O'qituvchi: {exam.teacherName}</span>
                  <span>{exam.participantCount} qatnashuvchi</span>
                </div>
              </CardBody>

              <div className="p-6 pt-0">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full font-bold shadow-md shadow-blue-500/20"
                  leftIcon={<Play className="w-4 h-4 fill-current" />}
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
          description="Siz qidirgan mezonlar bo'yicha hech qanday test topilmadi."
          actionText={t('common.all')}
          onAction={() => {
            setSearch('');
            setSelectedCategory(undefined);
            setSelectedDifficulty(undefined);
          }}
        />
      )}
    </div>
  );
};

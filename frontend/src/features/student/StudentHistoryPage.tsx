import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { History, Search, Eye, Award, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { attemptApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const StudentHistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterPassed, setFilterPassed] = useState<'all' | 'passed' | 'failed'>('all');

  const { data: attemptsRes, isLoading } = useQuery({
    queryKey: ['myAttemptsHistory'],
    queryFn: () => attemptApi.getMyAttempts(),
  });

  const attempts = attemptsRes?.data || [];

  const filteredAttempts = attempts.filter((a) => {
    const matchesSearch = a.examTitle.toLowerCase().includes(search.toLowerCase()) ||
                          a.categoryName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterPassed === 'passed') return a.passed;
    if (filterPassed === 'failed') return !a.passed;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('nav.history')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Siz topshirgan barcha testlar, o'tish natijalari va sarflangan vaqtlar
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="max-w-md w-full">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPassed('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterPassed === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('common.all')} ({attempts.length})
          </button>
          <button
            onClick={() => setFilterPassed('passed')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterPassed === 'passed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('results.passed')} ({attempts.filter((a) => a.passed).length})
          </button>
          <button
            onClick={() => setFilterPassed('failed')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterPassed === 'failed'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('results.failed')} ({attempts.filter((a) => !a.passed).length})
          </button>
        </div>
      </div>

      {/* Attempts Table / Grid */}
      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : filteredAttempts.length > 0 ? (
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-5">Test Nomi</th>
                  <th className="py-3.5 px-5">Kategoriya</th>
                  <th className="py-3.5 px-5">Natija</th>
                  <th className="py-3.5 px-5">Holat</th>
                  <th className="py-3.5 px-5">Vaqt</th>
                  <th className="py-3.5 px-5">Sana</th>
                  <th className="py-3.5 px-5 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredAttempts.map((attempt) => (
                  <tr
                    key={attempt.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-slate-100">
                      {attempt.examTitle}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: attempt.categoryColor || '#3B82F6' }}
                      >
                        {attempt.categoryName}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-black">
                      <span className={attempt.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {attempt.percentage}% ({attempt.earnedPoints}/{attempt.totalPoints} {t('common.points')})
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {attempt.passed ? (
                        <Badge variant="success" size="sm" dot>{t('results.passed')}</Badge>
                      ) : (
                        <Badge variant="danger" size="sm">{t('results.failed')}</Badge>
                      )}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {Math.floor(attempt.timeSpentSeconds / 60)} daq {attempt.timeSpentSeconds % 60} son
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/results/${attempt.id}`)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
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
          description="Hech qanday topshirilgan testlar topilmadi."
          actionText={t('student.exploreExams')}
          onAction={() => navigate('/exams')}
        />
      )}
    </div>
  );
};

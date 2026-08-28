import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, ArrowLeft, Eye, Award, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { resultApi, examApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const ExamParticipantsPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');

  const { data: examRes } = useQuery({
    queryKey: ['examDetail', examId],
    queryFn: () => examApi.getExamById(examId!),
    enabled: !!examId,
  });

  const { data: participantsRes, isLoading } = useQuery({
    queryKey: ['examParticipants', examId],
    queryFn: () => resultApi.getExamParticipants(examId!),
    enabled: !!examId,
  });

  const exam = examRes?.data;
  const participants = participantsRes?.data || [];

  const filtered = participants.filter(
    (p) =>
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.studentEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Back button */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/teacher/exams')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')} {t('nav.manageExams')}</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {exam ? `${exam.title} — Qatnashuvchilar` : t('nav.participants')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ushbu testni topshirgan barcha talabalar ro'yxati va ularning to'plagan ballari
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md w-full">
        <Input
          placeholder="Talaba ismi yoki emaili bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Roster Table */}
      {isLoading ? (
        <Skeleton className="h-80 w-full rounded-2xl" />
      ) : filtered.length > 0 ? (
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-5">Talaba</th>
                  <th className="py-3.5 px-5">Ball & Foiz</th>
                  <th className="py-3.5 px-5">Natija</th>
                  <th className="py-3.5 px-5">Vaqt</th>
                  <th className="py-3.5 px-5">Topshirilgan sana</th>
                  <th className="py-3.5 px-5 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filtered.map((p) => (
                  <tr key={p.attemptId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.studentAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.studentName)}&background=3B82F6&color=fff`}
                          alt={p.studentName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{p.studentName}</div>
                          <div className="text-xs text-slate-400">{p.studentEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-black">
                      <span className={p.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {p.percentage}% ({p.earnedPoints}/{p.totalPoints} ball)
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {p.passed ? (
                        <Badge variant="success" size="sm" dot>{t('results.passed')}</Badge>
                      ) : (
                        <Badge variant="danger" size="sm">{t('results.failed')}</Badge>
                      )}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {Math.floor(p.timeSpentSeconds / 60)} daq {p.timeSpentSeconds % 60} son
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(p.startedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/review/${p.attemptId}`)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        className="text-blue-600 dark:text-blue-400 font-bold"
                      >
                        Tahlil
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
          title="Qatnashuvchilar topilmadi"
          description="Ushbu testni hali hech kim topshirmagan."
        />
      )}
    </div>
  );
};

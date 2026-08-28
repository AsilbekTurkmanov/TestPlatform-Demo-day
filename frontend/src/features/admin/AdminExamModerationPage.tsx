import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Search, CheckCircle2, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import { examApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { ExamStatus } from '../../types';

export const AdminExamModerationPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [search, setSearch] = useState('');

  const { data: examsRes, isLoading } = useQuery({
    queryKey: ['adminAllExams'],
    queryFn: () => examApi.getExams({ pageSize: 100 }),
  });

  const exams = examsRes?.data?.items || [];

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      if (isPublished) {
        return examApi.unpublishExam(id);
      } else {
        return examApi.publishExam(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllExams'] });
      toastSuccess('Imtihon holati muvaffaqiyatli yangilandi');
    },
    onError: (err: any) => {
      toastError(err.message || 'Xatolik');
    },
  });

  const filtered = exams.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.teacherName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('admin.examModeration')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Platformadagi barcha o'qituvchilar tomonidan yaratilgan testlarni ko'rib chiqish va boshqarish
        </p>
      </div>

      <div className="max-w-md w-full">
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : filtered.length > 0 ? (
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-5">Test Nomi</th>
                  <th className="py-3.5 px-5">O'qituvchi</th>
                  <th className="py-3.5 px-5">Kategoriya</th>
                  <th className="py-3.5 px-5">Savollar soni</th>
                  <th className="py-3.5 px-5">Holat</th>
                  <th className="py-3.5 px-5 text-right">Moderatsiya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filtered.map((exam) => {
                  const isPublished = exam.status === ExamStatus.Published;

                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-slate-100">
                        {exam.title}
                      </td>
                      <td className="py-4 px-5 text-slate-700 dark:text-slate-300">
                        {exam.teacherName}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: exam.categoryColor || '#3B82F6' }}
                        >
                          {exam.categoryName}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-700 dark:text-slate-300">
                        {exam.totalQuestions} ta
                      </td>
                      <td className="py-4 px-5">
                        {isPublished ? (
                          <Badge variant="success" size="sm" dot>{t('common.published')}</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">{t('common.draft')}</Badge>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Button
                          variant={isPublished ? 'danger' : 'success'}
                          size="sm"
                          onClick={() => togglePublishMutation.mutate({ id: exam.id, isPublished })}
                          isLoading={togglePublishMutation.isPending}
                          className="text-xs font-bold"
                        >
                          {isPublished ? 'Moderatsiyadan olish' : 'Tasdiqlash & Nashr qilish'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState title="Testlar topilmadi" />
      )}
    </div>
  );
};

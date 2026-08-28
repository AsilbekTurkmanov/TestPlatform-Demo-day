import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  PlusCircle,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Globe,
  Lock,
  Users,
  FileQuestion,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { examApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { ExamStatus } from '../../types';

export const ExamManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [deleteModalExamId, setDeleteModalExamId] = useState<string | null>(null);

  const { data: examsRes, isLoading } = useQuery({
    queryKey: ['teacherExamsList'],
    queryFn: () => examApi.getTeacherExams(),
  });

  const exams = examsRes?.data || [];

  // Publish / Unpublish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      if (isPublished) {
        return examApi.unpublishExam(id);
      } else {
        return examApi.publishExam(id);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacherExamsList'] });
      queryClient.invalidateQueries({ queryKey: ['teacherMyExams'] });
      toastSuccess(variables.isPublished ? 'Test qoralamaga qaytarildi' : 'Test muvaffaqiyatli e\'lon qilindi!');
    },
    onError: (err: any) => {
      toastError(err.message || 'Xatolik yuz berdi');
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (id: string) => examApi.duplicateExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherExamsList'] });
      toastSuccess('Test nusxasi yaratildi!');
    },
    onError: (err: any) => {
      toastError(err.message || 'Nusxa yaratishda xatolik');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => examApi.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherExamsList'] });
      setDeleteModalExamId(null);
      toastSuccess('Test muvaffaqiyatli o\'chirildi');
    },
    onError: (err: any) => {
      toastError(err.message || 'O\'chirishda xatolik');
    },
  });

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('nav.manageExams')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Siz yaratgan barcha testlar, savollar va ularning holati
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/teacher/exams/new')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="font-bold shadow-md shadow-blue-500/20"
        >
          {t('teacher.createExam')}
        </Button>
      </div>

      {/* Search Filter */}
      <div className="max-w-md w-full">
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Exams Table */}
      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : filteredExams.length > 0 ? (
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-5">Test Nomi</th>
                  <th className="py-3.5 px-5">Kategoriya</th>
                  <th className="py-3.5 px-5">Savollar</th>
                  <th className="py-3.5 px-5">Davomiyligi</th>
                  <th className="py-3.5 px-5">Holat</th>
                  <th className="py-3.5 px-5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredExams.map((exam) => {
                  const isPublished = exam.status === ExamStatus.Published;

                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{exam.title}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">{exam.description}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: exam.categoryColor || '#3B82F6' }}
                        >
                          {exam.categoryName}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-700 dark:text-slate-300">
                        {exam.totalQuestions} ta
                      </td>
                      <td className="py-4 px-5 text-slate-700 dark:text-slate-300">
                        {exam.durationMinutes} daq
                      </td>
                      <td className="py-4 px-5">
                        {isPublished ? (
                          <Badge variant="success" size="sm" dot>{t('common.published')}</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">{t('common.draft')}</Badge>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right space-x-1 sm:space-x-2">
                        {/* Publish / Unpublish Toggle */}
                        <Button
                          variant={isPublished ? 'ghost' : 'outline'}
                          size="sm"
                          onClick={() => togglePublishMutation.mutate({ id: exam.id, isPublished })}
                          className={`text-xs font-bold ${isPublished ? 'text-amber-600' : 'text-emerald-600'}`}
                        >
                          {isPublished ? t('teacher.unpublish') : t('teacher.publish')}
                        </Button>

                        {/* Questions Builder */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/teacher/exams/${exam.id}/questions`)}
                          leftIcon={<FileQuestion className="w-3.5 h-3.5" />}
                          className="text-xs font-bold"
                        >
                          Savollar
                        </Button>

                        {/* Participants */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/teacher/exams/${exam.id}/participants`)}
                          leftIcon={<Users className="w-3.5 h-3.5" />}
                          className="text-xs font-bold text-blue-600"
                        >
                          Natijalar
                        </Button>

                        {/* Edit metadata */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}
                          className="text-xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        {/* Duplicate */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateMutation.mutate(exam.id)}
                          className="text-xs text-purple-600"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModalExamId(exam.id)}
                          className="text-xs text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <EmptyState
          title={t('common.noData')}
          description="Hech qanday test topilmadi."
          actionText={t('teacher.createExam')}
          onAction={() => navigate('/teacher/exams/new')}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalExamId}
        onClose={() => setDeleteModalExamId(null)}
        title="Testni o'chirish"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Haqiqatan ham ushbu testni va unga tegishli barcha savollarni o'chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteModalExamId(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteModalExamId && deleteMutation.mutate(deleteModalExamId)}
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

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderTree,
  PlusCircle,
  Edit,
  Trash2,
  Check,
  X,
  Code2,
  Binary,
  Languages,
  Atom,
} from 'lucide-react';
import { categoryApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../components/common/Toast';
import { Category } from '../../types';

export const CategoryManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  // Form
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descriptionUz, setDescriptionUz] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('Code2');

  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ['categoriesAdmin'],
    queryFn: () => categoryApi.getCategories(false),
  });

  const categories = categoriesRes?.data || [];

  const openCreateModal = () => {
    setEditingCategory(null);
    setNameUz('');
    setNameRu('');
    setNameEn('');
    setDescriptionUz('');
    setColor('#3B82F6');
    setIcon('Code2');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setNameUz(c.nameUz);
    setNameRu(c.nameRu);
    setNameEn(c.nameEn);
    setDescriptionUz(c.descriptionUz || '');
    setColor(c.color || '#3B82F6');
    setIcon(c.icon || 'Code2');
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        nameUz,
        nameRu,
        nameEn,
        descriptionUz,
        color,
        icon,
        isActive: true,
      };

      if (editingCategory) {
        return categoryApi.updateCategory(editingCategory.id, payload);
      } else {
        return categoryApi.createCategory(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['categoriesAll'] });
      setIsModalOpen(false);
      toastSuccess(editingCategory ? 'Kategoriya yangilandi' : 'Yangi kategoriya yaratildi');
    },
    onError: (err: any) => {
      toastError(err.message || 'Xatolik yuz berdi');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoriesAdmin'] });
      setDeleteCategoryId(null);
      toastSuccess('Kategoriya o\'chirildi');
    },
    onError: (err: any) => {
      toastError(err.message || 'O\'chirishda xatolik');
    },
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('admin.categoryManagement')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ko'p tilli nomlar, ranglar va fan yo'nalishlarini sozlash
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="font-bold shadow-md shadow-blue-500/20"
        >
          {t('admin.addCategory')}
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Card key={cat.id} className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
              <CardBody className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: cat.color || '#3B82F6' }}
                  >
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <Badge variant={cat.isActive ? 'success' : 'secondary'} size="sm">
                    {cat.examCount} ta test
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    🇺🇿 {cat.nameUz}
                  </h3>
                  <p className="text-xs text-slate-400">🇷🇺 {cat.nameRu}</p>
                  <p className="text-xs text-slate-400">🇬🇧 {cat.nameEn}</p>
                </div>

                {cat.descriptionUz && (
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {cat.descriptionUz}
                  </p>
                )}
              </CardBody>

              <div className="p-4 pt-0 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(cat)}
                  className="text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteCategoryId(cat.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Kategoriyani tahrirlash' : t('admin.addCategory')}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Nomi (O'zbekcha) *"
            value={nameUz}
            onChange={(e) => setNameUz(e.target.value)}
            required
          />

          <Input
            label="Nomi (Русский) *"
            value={nameRu}
            onChange={(e) => setNameRu(e.target.value)}
            required
          />

          <Input
            label="Nomi (English) *"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Tavsif (O'zbekcha)
            </label>
            <textarea
              value={descriptionUz}
              onChange={(e) => setDescriptionUz(e.target.value)}
              rows={2}
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Rang (HEX)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteCategoryId}
        onClose={() => setDeleteCategoryId(null)}
        title="Kategoriyani o'chirish"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Ushbu kategoriyani o'chirishni tasdiqlaysizmi?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteCategoryId(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteCategoryId && deleteMutation.mutate(deleteCategoryId)}
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

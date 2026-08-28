import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Power,
  Lock,
} from 'lucide-react';
import { userApi } from '../../api/services';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { User, UserRole } from '../../types';

export const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch Users
  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['adminUsersList', search, roleFilter],
    queryFn: () => userApi.getUsers({ search, role: roleFilter, pageSize: 50 }),
  });

  const users = usersRes?.data?.items || [];

  // Toggle Activation Mutation
  const toggleActivationMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (active) {
        return userApi.deactivateUser(id);
      } else {
        return userApi.activateUser(id);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsersList'] });
      toastSuccess(variables.active ? 'Foydalanuvchi faolsizlantirildi' : 'Foydalanuvchi faollashtirildi');
    },
    onError: (err: any) => {
      toastError(err.message || 'Xatolik yuz berdi');
    },
  });

  // Save / Update User Mutation
  const saveUserMutation = useMutation({
    mutationFn: async () => {
      if (editingUser) {
        return userApi.updateUser(editingUser.id, {
          fullName,
          email,
          role,
          isActive,
          phoneNumber,
          password: password || undefined,
        });
      } else {
        return userApi.createUser({
          fullName,
          email,
          password,
          role,
          phoneNumber,
          isActive,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsersList'] });
      setIsCreateModalOpen(false);
      setEditingUser(null);
      toastSuccess(editingUser ? 'Foydalanuvchi yangilandi' : 'Yangi foydalanuvchi yaratildi');
    },
    onError: (err: any) => {
      toastError(err.message || 'Saqlashda xatolik yuz berdi');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsersList'] });
      setDeleteUserId(null);
      toastSuccess('Foydalanuvchi o\'chirildi');
    },
    onError: (err: any) => {
      toastError(err.message || 'O\'chirishda xatolik');
    },
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setRole(UserRole.Student);
    setPhoneNumber('');
    setIsActive(true);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFullName(u.fullName);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setPhoneNumber(u.phoneNumber || '');
    setIsActive(u.isActive);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t('admin.userManagement')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Platforma a'zolari, o'qituvchilar va administratorlar hisoblarini boshqarish
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="font-bold shadow-md shadow-blue-500/20"
        >
          {t('admin.addUser')}
        </Button>
      </div>

      {/* Filters & Search */}
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
            onClick={() => setRoleFilter(undefined)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              roleFilter === undefined
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => setRoleFilter(UserRole.Student)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              roleFilter === UserRole.Student
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('common.student')}
          </button>
          <button
            onClick={() => setRoleFilter(UserRole.Teacher)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              roleFilter === UserRole.Teacher
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('common.teacher')}
          </button>
          <button
            onClick={() => setRoleFilter(UserRole.Admin)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              roleFilter === UserRole.Admin
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('common.admin')}
          </button>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : users.length > 0 ? (
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-5">Foydalanuvchi</th>
                  <th className="py-3.5 px-5">{t('common.role')}</th>
                  <th className="py-3.5 px-5">{t('common.status')}</th>
                  <th className="py-3.5 px-5">Ro'yxatdan o'tgan</th>
                  <th className="py-3.5 px-5 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=3B82F6&color=fff`}
                          alt={u.fullName}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{u.fullName}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      {u.role === UserRole.Admin ? (
                        <Badge variant="danger" size="sm">Admin</Badge>
                      ) : u.role === UserRole.Teacher ? (
                        <Badge variant="purple" size="sm">Teacher</Badge>
                      ) : (
                        <Badge variant="primary" size="sm">Student</Badge>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      {u.isActive ? (
                        <Badge variant="success" size="sm" dot>Faol</Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">Nofaol</Badge>
                      )}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right space-x-1 sm:space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActivationMutation.mutate({ id: u.id, active: u.isActive })}
                        className={u.isActive ? 'text-amber-600' : 'text-emerald-600'}
                        title={u.isActive ? t('admin.deactivate') : t('admin.activate')}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(u)}
                        className="text-blue-600"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteUserId(u.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState title="Foydalanuvchilar topilmadi" />
      )}

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingUser ? 'Foydalanuvchini tahrirlash' : t('admin.addUser')}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveUserMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label={t('auth.fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label={editingUser ? 'Yangi parol (agar o\'zgartirmoqchi bo\'lsangiz)' : t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editingUser}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('common.role')}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(Number(e.target.value) as UserRole)}
              className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm p-2.5"
            >
              <option value={UserRole.Student}>{t('common.student')}</option>
              <option value={UserRole.Teacher}>{t('common.teacher')}</option>
              <option value={UserRole.Admin}>{t('common.admin')}</option>
            </select>
          </div>

          <Input
            label={t('auth.phoneNumber')}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={saveUserMutation.isPending}
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        title="Foydalanuvchini o'chirish"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Haqiqatan ham ushbu foydalanuvchini o'chirib tashlamoqchimisiz?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteUserId && deleteMutation.mutate(deleteUserId)}
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

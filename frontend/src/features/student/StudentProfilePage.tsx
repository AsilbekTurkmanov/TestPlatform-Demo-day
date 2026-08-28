import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Lock, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/I18nContext';
import { authApi } from '../../api/services';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { UserRole } from '../../types';

export const StudentProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const { success: toastSuccess, error: toastError } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await authApi.updateProfile({
        fullName,
        phoneNumber,
        bio,
      });
      if (res.success && res.data) {
        updateUser(res.data);
        toastSuccess('Profil muvaffaqiyatli saqlandi!');
      }
    } catch (err: any) {
      toastError(err.message || 'Profilni saqlashda xatolik.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toastError('Yangi parollar mos kelmadi.');
      return;
    }
    if (newPassword.length < 6) {
      toastError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      if (res.success) {
        toastSuccess('Parol muvaffaqiyatli o\'zgartirildi!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      toastError(err.message || 'Parolni o\'zgartirishda xatolik.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('common.profile')} & {t('common.settings')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Shaxsiy ma'lumotlaringizni tahrirlash va xavfsizlik sozlamalari
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* User Card */}
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 p-6 text-center space-y-4">
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=3B82F6&color=fff&size=128`}
            alt={user.fullName}
            className="w-24 h-24 rounded-3xl mx-auto object-cover ring-4 ring-blue-500/20 shadow-md"
          />
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{user.fullName}</h3>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <Badge variant="primary" size="md">
            {user.role === UserRole.Admin ? t('common.admin') : user.role === UserRole.Teacher ? t('common.teacher') : t('common.student')}
          </Badge>
        </Card>

        {/* Edit Forms (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
            <CardHeader className="p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Shaxsiy ma'lumotlar
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  label={t('auth.fullName')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<UserIcon className="w-4 h-4" />}
                  required
                />

                <Input
                  label={t('auth.email')}
                  value={user.email}
                  leftIcon={<Mail className="w-4 h-4" />}
                  disabled
                  helperText="Elektron pochta manzilini o'zgartirib bo'lmaydi"
                />

                <Input
                  label={t('auth.phoneNumber')}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isUpdatingProfile}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="font-bold"
                >
                  {t('common.save')}
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Change Password Form */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
            <CardHeader className="p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Parolni o'zgartirish
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Joriy parol"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Yangi parol"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Yangi parolni tasdiqlang"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  isLoading={isChangingPassword}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                  className="font-bold"
                >
                  Parolni yangilash
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

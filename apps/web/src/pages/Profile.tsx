import { useState } from 'react';
import { Bell, Sun, CloudUpload, RefreshCcw, KeyRound, Lock, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useUpdatePreferences } from '../api/users';
import { Avatar } from '../components/Avatar';

export function Profile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updatePreferences = useUpdatePreferences();

  const [push, setPush] = useState(user?.preferences?.push ?? false);
  const [cloudSync, setCloudSync] = useState(user?.preferences?.cloudSync ?? false);

  function handlePushToggle() {
    const next = !push;
    setPush(next);
    if (user) {
      updatePreferences.mutate({ push: next });
    }
  }

  function handleCloudToggle() {
    const next = !cloudSync;
    setCloudSync(next);
    if (user) {
      updatePreferences.mutate({ cloudSync: next });
    }
  }

  return (
    <div className="pb-4">
      {/* Header icons */}
      <div className="flex justify-end gap-2 px-4 pt-4">
        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
          <HelpCircle size={18} />
        </button>
        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
          <Bell size={18} />
        </button>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center py-6 px-4">
        <div className="relative mb-3">
          <Avatar name={user?.name ?? 'Usuário'} avatarUrl={user?.avatarUrl} size="xl" />
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
            <span className="text-xs text-gray-500">✏</span>
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{user?.name ?? 'Usuário'}</h2>
        {user?.bio && <p className="text-sm text-gray-400 mt-1 text-center">{user.bio}</p>}
      </div>

      {/* Settings card */}
      <div className="mx-4">
        <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 text-center">
            <span className="text-base font-semibold text-gray-700">Configurações</span>
          </div>

          {/* Preferences */}
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Preferências do app</p>

            <div className="space-y-1">
              {/* Push */}
              <div className="flex items-center gap-3 py-3 px-3 bg-white rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Bell size={18} className="text-brand-purple" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700">Notificações Push</span>
                <button
                  onClick={handlePushToggle}
                  className={`w-12 h-6 rounded-full transition-colors ${push ? 'bg-brand-purple' : 'bg-gray-200'}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow ml-0.5 transition-transform ${push ? 'translate-x-6' : ''}`}
                  />
                </button>
              </div>

              {/* Theme */}
              <div className="flex items-center gap-3 py-3 px-3 bg-white rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <Sun size={18} className="text-green-500" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700">Tema do sistema</span>
                <span className="text-sm text-gray-400">Claro</span>
              </div>

              {/* Cloud sync */}
              <div className="flex items-center gap-3 py-3 px-3 bg-white rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CloudUpload size={18} className="text-blue-500" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700">Sincronização Cloud</span>
                {cloudSync ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCloudToggle}
                    className="w-12 h-6 rounded-full bg-gray-200 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="px-4 pt-3 pb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Segurança</p>

            <div className="space-y-1">
              {/* Change password */}
              <button className="w-full flex items-center gap-3 py-3 px-3 bg-white rounded-xl text-left">
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                  <RefreshCcw size={18} className="text-orange-400" />
                </div>
                <span className="text-sm font-medium text-gray-700">Alterar a senha</span>
              </button>

              {/* 2FA - disabled */}
              <button disabled className="w-full flex items-center gap-3 py-3 px-3 bg-white rounded-xl text-left opacity-60 cursor-not-allowed" title="Em breve">
                <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <KeyRound size={18} className="text-yellow-400" />
                </div>
                <span className="text-sm font-medium text-gray-700">Definir 2FA</span>
              </button>

              {/* App lock - disabled */}
              <button disabled className="w-full flex items-center gap-3 py-3 px-3 bg-white rounded-xl text-left opacity-60 cursor-not-allowed" title="Em breve">
                <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                  <Lock size={18} className="text-red-400" />
                </div>
                <span className="text-sm font-medium text-gray-700">Definir bloqueio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full mt-4 py-3 rounded-2xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

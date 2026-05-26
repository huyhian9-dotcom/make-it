import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../api/auth';
import { useAuthStore } from '../store/auth';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await registerApi({ name, email, password });
      login(result.token, result.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <div className="w-full max-w-[440px] min-h-screen relative flex flex-col overflow-hidden bg-white">
        {/* Gradient top */}
        <div className="absolute top-0 left-0 right-0 h-72 gradient-brand opacity-50 pointer-events-none" />

        {/* Back circle */}
        <div className="absolute top-6 left-6 w-9 h-9 rounded-full border-2 border-gray-300 bg-white/80" />

        {/* Content */}
        <div className="relative flex flex-col flex-1 px-8 pt-32 pb-12">
          {/* Brand */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black tracking-tight" style={{ fontFamily: 'cursive' }}>
              Make it!
            </h1>
          </div>

          <p className="text-lg font-medium text-gray-700 mb-6">Crie sua conta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
              className="w-full px-5 py-4 rounded-full bg-gray-100 border-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-5 py-4 rounded-full bg-gray-100 border-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              required
              minLength={6}
              className="w-full px-5 py-4 rounded-full bg-gray-100 border-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full border-2 border-brand-purple text-brand-purple font-semibold text-base hover:bg-brand-purple hover:text-white transition-colors disabled:opacity-60"
              >
                {loading ? 'Criando...' : 'Make IT!'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-gray-500 uppercase tracking-widest hover:text-brand-purple"
            >
              Ja possuo conta!
            </Link>
          </div>
        </div>

        {/* Gradient bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-64 gradient-brand opacity-40 pointer-events-none" />
      </div>
    </div>
  );
}

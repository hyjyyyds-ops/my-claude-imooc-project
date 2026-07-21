import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const data = await api.register(form);
      localStorage.setItem('expense_token_v1', data.token);
      localStorage.setItem('expense_current_user_v1', data.user.id);
      localStorage.setItem('expense_user_v1', JSON.stringify(data.user));
      showToast(data.message || '注册成功 ✨', 'success');
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      showToast(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">🐾</div>
          <h1 className="text-3xl font-bold text-text-brown mb-2">创建账户</h1>
          <p className="text-text-warm text-sm">开始你的可爱记账之旅 🌸</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-cute shadow-soft p-8 space-y-4">
          <input
            type="text"
            value={form.username}
            onChange={handleChange('username')}
            placeholder="设置用户名（3-20 位）"
            className="input-field"
            maxLength={20}
            disabled={loading}
            autoComplete="username"
          />
          <input
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="设置密码（6-20 位）"
            className="input-field"
            maxLength={20}
            disabled={loading}
            autoComplete="new-password"
          />
          <input
            type="password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            placeholder="请再输入一次密码"
            className="input-field"
            maxLength={20}
            disabled={loading}
            autoComplete="new-password"
          />
          <button type="submit" className="btn-primary w-full text-lg" disabled={loading}>
            {loading ? '请稍等...' : '✨ 注 册 ✨'}
          </button>
        </form>

        <p className="text-center mt-6 text-text-warm text-sm">
          已有账户？{' '}
          <Link to="/login" className="text-pink-primary font-medium hover:underline">
            立即登录
          </Link>
        </p>

        {toast && (
          <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-cute shadow-soft z-50
              ${toast.type === 'success' ? 'bg-income text-white' : 'bg-pink-primary text-white'}`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </main>
  );
}

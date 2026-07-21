import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]     = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('expense_user_v1');
    if (u) setUser(JSON.parse(u));
    api.health().then(setHealth).catch(() => setHealth({ ok: false }));
  }, []);

  const logout = () => {
    localStorage.removeItem('expense_token_v1');
    localStorage.removeItem('expense_current_user_v1');
    localStorage.removeItem('expense_user_v1');
    navigate('/login');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-text-warm">加载中...</div>;
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-brown">记账首页</h1>
            <p className="text-text-warm text-sm mt-1">欢迎，{user.username} 🐱</p>
          </div>
          <button onClick={logout} className="text-sm text-text-warm hover:text-pink-primary">
            退出登录
          </button>
        </div>

        <div className="bg-white rounded-cute shadow-soft p-8 text-center mb-4">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-text-brown font-medium mb-2">登录成功！</p>
          <p className="text-text-warm text-sm">JWT 鉴权已生效 ✓</p>
        </div>

        <div className="bg-white rounded-cute shadow-soft p-6 text-sm">
          <h3 className="font-medium text-text-brown mb-2">🔌 后端健康检查</h3>
          {health?.ok
            ? <p className="text-income">✓ MySQL 连接正常</p>
            : <p className="text-expense">✗ MySQL 连接异常</p>}
        </div>
      </div>
    </main>
  );
}

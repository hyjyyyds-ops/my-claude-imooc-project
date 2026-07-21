import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-3">🐱</div>
        <h1 className="text-3xl font-bold text-text-brown mb-2">每日记账</h1>
        <p className="text-text-warm text-sm mb-8">轻松记账，可爱生活 💕</p>

        <div className="bg-white rounded-cute shadow-soft p-6 mb-6 text-left">
          <h2 className="text-lg font-bold text-text-brown mb-3">📡 后端服务已就绪</h2>
          <ul className="space-y-2 text-sm text-text-warm">
            <li>✅ <code className="text-pink-primary">POST /api/auth/register</code></li>
            <li>✅ <code className="text-pink-primary">POST /api/auth/login</code></li>
            <li>✅ <code className="text-pink-primary">GET  /api/health</code></li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link to="/login"    className="btn-primary flex-1 text-center">登 录</Link>
          <Link to="/register" className="btn-primary flex-1 text-center bg-pink-soft text-text-brown">注 册</Link>
        </div>
      </div>
    </main>
  );
}

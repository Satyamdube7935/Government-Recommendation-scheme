import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.profileComplete ? '/recommendations' : '/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to view your scheme matches.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            placeholder="••••••••"
          />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="demo-hint">Demo: citizen@demo.com / demo123</p>
      </form>
    </div>
  );
}

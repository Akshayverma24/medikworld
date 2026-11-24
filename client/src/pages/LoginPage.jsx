import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';
import { Pill, Lock, Mail, ArrowRight, UserCheck, Sparkles, Building2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(formData);
      if (user.role === 'pharmacy') {
        navigate('/pharmacy-dashboard');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } catch (err) {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email, password) => {
    setFormData({ email, password });
    setErrors({});
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
            <Pill className="w-6 h-6 rotate-45" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500">
            Sign in to check medicine availability, reserve pickups, or manage your store.
          </p>
        </div>

        {/* Quick Test Accounts Box */}
        <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/70 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Quick Test Accounts:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemo('rahul@medfinder.com', 'password123')}
              className="py-1.5 px-2 rounded-xl bg-white border border-sky-200 hover:bg-sky-100 font-bold text-sky-800 flex items-center justify-center gap-1 transition-colors"
            >
              <UserCheck className="w-3 h-3" />
              <span>Patient Account</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('apollo@medfinder.com', 'password123')}
              className="py-1.5 px-2 rounded-xl bg-white border border-sky-200 hover:bg-sky-100 font-bold text-sky-800 flex items-center justify-center gap-1 transition-colors"
            >
              <Building2 className="w-3 h-3" />
              <span>Pharmacy Partner</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl border ${
                  errors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-sky-500'
                } focus:outline-none focus:ring-2`}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl border ${
                  errors.password ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-sky-500'
                } focus:outline-none focus:ring-2`}
              />
            </div>
            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

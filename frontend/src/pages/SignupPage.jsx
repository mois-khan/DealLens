import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password, fullName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-sans font-semibold text-text-primary">
          Start your Investor Platform
        </h1>
        <p className="text-sm text-text-muted mt-2">Automate your deal flow with DealLens</p>
      </div>

      <div className="max-w-md w-full shadow-card bg-bg-surface rounded-2xl p-8 border border-white/5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-text-faint mb-2">Full Name</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-bg-base px-4 py-3 text-sm text-text-primary focus:border-accent/50 outline-none transition-all"
              placeholder="Sarah Chen"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-text-faint mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-bg-base px-4 py-3 text-sm text-text-primary focus:border-accent/50 outline-none transition-all"
              placeholder="sarah@chenventures.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-text-faint mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-bg-base px-4 py-3 text-sm text-text-primary focus:border-accent/50 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-xs font-mono text-verdict-red-text bg-verdict-red-bar/10 p-3 rounded border border-verdict-red-bar/20">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-accent hover:bg-accent-light text-bg-base font-sans font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
               <div className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin" />
            ) : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-text-muted">
            Already have an account? <Link to="/login" className="text-accent hover:underline">Log in</Link>
          </p>
        </div>
      </div>

      <p className="mt-8 text-[10px] font-mono text-text-faint max-w-xs text-center uppercase tracking-wider leading-relaxed">
        By creating an account, you agree to automate your intelligence and respect the data.
      </p>
    </div>
  );
}

export default SignupPage;

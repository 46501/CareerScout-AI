import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Sparkles } from 'lucide-react';

export function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setError('');
      await registerUser({ fullName, email, password });
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-8 w-8 text-primary-400" />
            <span className="text-3xl font-bold text-white tracking-tight">CareerScout AI</span>
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        <Card className="glass-card border-slate-800/50 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-white">Sign Up</CardTitle>
            <CardDescription className="text-slate-400">Join CareerScout AI to discover your next big opportunity.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
              {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md border border-red-900/50">{error}</div>}
              <div className="space-y-4">
                <div>
                  <label htmlFor="full-name" className="sr-only">Full Name</label>
                  <Input
                    id="full-name"
                    name="fullName"
                    type="text"
                    required
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 h-12"
                  />
                </div>
                <div>
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 h-12"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 h-12"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 h-12"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white h-12 font-medium shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

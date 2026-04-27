import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import PhoneInput from '@/components/ui/PhoneInput';
import OTPInput from '@/components/ui/OTPInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { DEFAULT_COUNTRY } from '@/utils/countryCodes';
import type { CountryCode } from '@/types';

type Step = 'phone' | 'otp' | 'success';

const FEATURES = [
  { icon: '💪', text: 'Manage unlimited clients' },
  { icon: '📊', text: 'Track performance metrics' },
  { icon: '🥗', text: 'Design custom meal plans' },
  { icon: '🏋️', text: 'Build personalized workouts' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [step, setStep] = useState<Step>('phone');
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 6) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.sendOtp(country.dial_code, phone);
      if (res.data.dev_otp) {
        setDevOtp(res.data.dev_otp);
        toast.success(`Dev OTP: ${res.data.dev_otp}`, { duration: 10000 });
      } else {
        toast.success('OTP sent to your phone');
      }
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(country.dial_code, phone, otp);
      login(res.data.access_token, res.data.coach_id);
      setStep('success');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Invalid OTP, please try again');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp('');
    await handleSendOtp();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden flex-col justify-between p-12"
           style={{ background: 'linear-gradient(135deg, #050510 0%, #0a1628 60%, #0d2040 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-neon-green/10"
              style={{
                width: `${200 + i * 120}px`,
                height: `${200 + i * 120}px`,
                left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(0,255,135,0.08) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-neon-green flex items-center justify-center">
              <span className="text-dark-300 text-xl">⚡</span>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">FitCoach</p>
              <p className="text-neon-green text-xs font-bold tracking-widest">PRO PLATFORM</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black text-white leading-tight mb-4"
          >
            Transform
            <br />
            <span className="neon-text">Every Client's</span>
            <br />
            Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-white/50 text-lg mb-10 max-w-sm"
          >
            The elite coaching platform built for performance-driven coaches.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-3"
          >
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 glass-card px-3 py-2.5">
                <span className="text-xl">{f.icon}</span>
                <span className="text-white/70 text-sm">{f.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {['🧑', '👩', '🧑‍🦱', '👩‍🦰'].map((e, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-dark-300
                                     flex items-center justify-center text-sm">{e}</div>
            ))}
          </div>
          <p className="text-white/40 text-sm">Trusted by <span className="text-neon-green font-bold">2,400+</span> coaches worldwide</p>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-neon-green/10 border border-neon-green/20
                                  flex items-center justify-center mb-5">
                    <Smartphone size={26} className="text-neon-green" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">Welcome Back</h2>
                  <p className="text-white/40">Sign in with your phone number to access your coaching dashboard.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm font-medium block mb-2">Phone Number</label>
                    <PhoneInput
                      countryCode={country}
                      phoneNumber={phone}
                      onCountryChange={setCountry}
                      onPhoneChange={setPhone}
                      disabled={loading}
                    />
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={loading || !phone}
                    data-testid="send-otp-button"
                    className="neon-btn w-full flex items-center justify-center gap-2 text-base h-12"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-white/25 text-xs text-center mt-6">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-neon-green/10 border border-neon-green/20
                                  flex items-center justify-center mb-5">
                    <Shield size={26} className="text-neon-green" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">Verify OTP</h2>
                  <p className="text-white/40">
                    Enter the 6-digit code sent to{' '}
                    <span className="text-white font-semibold">{country.dial_code} {phone}</span>
                  </p>
                </div>

                {devOtp && (
                  <div className="glass-card border border-neon-green/20 p-3 rounded-xl mb-5 flex items-center gap-2">
                    <span className="text-neon-green text-xs font-mono font-bold">DEV OTP: {devOtp}</span>
                  </div>
                )}

                <div className="space-y-6">
                  <OTPInput value={otp} onChange={setOtp} disabled={loading} />

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    data-testid="verify-otp-button"
                    className="neon-btn w-full flex items-center justify-center gap-2 text-base h-12"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Verify & Sign In'}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      onClick={() => { setStep('phone'); setOtp(''); setDevOtp(''); }}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      ← Change number
                    </button>
                    <button
                      onClick={handleResend}
                      disabled={resendTimer > 0 || loading}
                      className="flex items-center gap-1.5 text-neon-green/70 hover:text-neon-green
                                 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw size={13} />
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-20 h-20 rounded-full bg-neon-green/15 border-2 border-neon-green/40
                             flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 size={40} className="text-neon-green" />
                </motion.div>
                <h2 className="text-2xl font-black text-white mb-2">You're in!</h2>
                <p className="text-white/40">Redirecting to your dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

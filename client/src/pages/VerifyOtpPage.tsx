import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, RotateCcw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      if (data.token) {
        // Need to fetch user since verifyOtp only returns token
        authApi.fetchMe().then((me) => {
          setAuth(me.user, data.token!);
          toast.success(data.message);
          navigate('/dashboard/notes');
        });
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Verification failed');
    },
  });

  const resendMutation = useMutation({
    mutationFn: authApi.resendOtp,
    onSuccess: (data) => {
      toast.success(data.message);
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    },
  });

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d) && email) {
      verifyMutation.mutate({ email, otp: newOtp.join('') });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    paste.split('').forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    const focusIndex = Math.min(paste.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  if (!email) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-card-foreground">
        Verify your email
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the 6-digit code sent to <strong className="text-foreground">{email}</strong>
      </p>

      <div className="mt-6 flex justify-center gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="h-12 w-12 rounded-lg border border-input bg-background text-center text-xl font-bold text-foreground outline-none ring-ring transition-all focus:ring-2"
          />
        ))}
      </div>

      {verifyMutation.isPending && (
        <div className="mt-4 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-sm">
        {timer > 0 ? (
          <span className="text-muted-foreground">
            Resend in {timer}s
          </span>
        ) : (
          <button
            onClick={() => resendMutation.mutate(email)}
            disabled={resendMutation.isPending}
            className="flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}

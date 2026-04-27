import { useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { motion } from 'framer-motion';

interface Props {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function OTPInput({ value, onChange, disabled }: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const focus = (idx: number) => {
    inputs.current[idx]?.focus();
    inputs.current[idx]?.select();
  };

  const handleChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/, '').slice(-1);
    const next = [...digits];
    next[idx] = digit;
    onChange(next.join(''));
    if (digit && idx < 5) focus(idx + 1);
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = '';
        onChange(next.join(''));
      } else if (idx > 0) {
        focus(idx - 1);
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      focus(idx - 1);
    } else if (e.key === 'ArrowRight' && idx < 5) {
      focus(idx + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    focus(Math.min(pasted.length, 5));
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.05 }}
        >
          <input
            ref={(el) => { inputs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[idx] || ''}
            disabled={disabled}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            onFocus={() => focus(idx)}
            data-testid={`otp-input-${idx}`}
            className={`
              w-12 h-14 text-center text-2xl font-bold rounded-xl border-2
              bg-white/5 text-white outline-none transition-all duration-200
              ${digits[idx]
                ? 'border-neon-green shadow-neon text-neon-green'
                : 'border-white/20 focus:border-neon-green/60'
              }
              disabled:opacity-40 disabled:cursor-not-allowed
              caret-transparent
            `}
          />
        </motion.div>
      ))}
    </div>
  );
}

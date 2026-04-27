import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRY_CODES, DEFAULT_COUNTRY } from '@/utils/countryCodes';
import type { CountryCode } from '@/types';

interface Props {
  countryCode: CountryCode;
  phoneNumber: string;
  onCountryChange: (c: CountryCode) => void;
  onPhoneChange: (v: string) => void;
  disabled?: boolean;
}

export default function PhoneInput({
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial_code.includes(search)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex gap-2">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          data-testid="country-code-button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-3
                     text-white hover:bg-white/8 hover:border-neon-green/30 transition-all duration-200
                     min-w-[100px] disabled:opacity-40"
        >
          <span className="text-lg">{countryCode.flag}</span>
          <span className="text-sm font-semibold text-neon-green">{countryCode.dial_code}</span>
          <ChevronDown size={14} className={`text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-72 glass-card shadow-glass z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    autoFocus
                    placeholder="Search country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="country-search"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2
                               text-sm text-white placeholder:text-white/30 outline-none
                               focus:border-neon-green/50"
                  />
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {filtered.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onCountryChange(c);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/8
                                transition-colors text-left
                                ${c.code === countryCode.code ? 'bg-neon-green/10 text-neon-green' : 'text-white/80'}`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-white/40 font-mono text-xs">{c.dial_code}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="py-8 text-center text-white/30 text-sm">No results</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        type="tel"
        placeholder="Phone number"
        value={phoneNumber}
        disabled={disabled}
        onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
        data-testid="phone-number-input"
        className="input-field flex-1"
        maxLength={15}
      />
    </div>
  );
}

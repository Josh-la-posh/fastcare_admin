import * as React from 'react';
import apiClient from '@/services/axiosInstance';
import { fetchWithCache } from '@/lib/cache';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, ChevronDown } from 'lucide-react';

interface BankItem {
  id: number;
  code: string; // bank code to send to backend
  name: string; // bank name to display
}

interface BankApiResponse {
  statusCode: number;
  data: BankItem[];
  hasMore: boolean;
}

interface BankSelectProps {
  value: string;              // selected bank code
  onChange: (code: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string | null;
  helperText?: string;
  country?: string;           // default 'nigeria'
  className?: string;
  dropdownClassName?: string;
  forceRefresh?: boolean;     // bypass cache
}

const BANK_CACHE_PREFIX = 'bank_cache_v2_';
const BANK_TTL_MS = 12 * 60 * 60 * 1000; // 12h

export const BankSelect: React.FC<BankSelectProps> = ({
  value,
  onChange,
  label = 'Bank',
  placeholder = 'Select bank',
  disabled,
  required,
  error,
  helperText,
  country = 'nigeria',
  className,
  dropdownClassName,
  forceRefresh = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [banks, setBanks] = React.useState<BankItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const selectedBank = banks.find(b => b.code === value);

  const loadBanks = React.useCallback(async () => {
    try {
      setLoading(true);
      const cacheKey = `${BANK_CACHE_PREFIX}${country.toLowerCase()}`;
      const list = await fetchWithCache<BankItem[]>(
        cacheKey,
        BANK_TTL_MS,
        async () => {
          const res = await apiClient.get<BankApiResponse>('/Payment/banks', { params: { country } });
          return res.data?.data || [];
        },
        forceRefresh,
      );
      setBanks(list);
    } catch (e) {
      console.error('Failed to load banks', e);
    } finally {
      setLoading(false);
    }
  }, [country, forceRefresh]);

  React.useEffect(() => {
    if (open && banks.length === 0) {
      loadBanks();
    }
  }, [open, loadBanks, banks.length]);

  // Ensure we load banks eagerly when a preselected value exists so the input shows the bank name
  React.useEffect(() => {
    if (value && !banks.length && !loading) {
      loadBanks();
    }
  }, [value, banks.length, loading, loadBanks]);

  // outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = banks.filter(b => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.code.includes(q);
  });

  const handleSelect = (b: BankItem) => {
    onChange(b.code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Input
        label={label}
        value={selectedBank ? selectedBank.name : ''}
        onClick={() => !disabled && setOpen(o => !o)}
        readOnly
        required={required}
        error={error || undefined}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"
        aria-label="Toggle bank list"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <div className={cn('absolute z-50 mt-2 w-full rounded-md border bg-white shadow-lg p-2', dropdownClassName)}>
          <div className="flex items-center gap-2 mb-2 px-2 py-1 border rounded">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              className="w-full text-sm outline-none"
              placeholder="Search bank..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-auto text-sm">
            {loading && <div className="py-2 px-2">Loading...</div>}
            {!loading && filtered.length === 0 && (
              <div className="py-2 px-2 text-gray-500">No results</div>
            )}
            {!loading && filtered.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelect(b)}
                className={cn(
                  'w-full flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100',
                  value === b.code && 'bg-gray-100 font-medium'
                )}
              >
                <span className="truncate pr-2" title={b.name}>{b.name}</span>
                {/* <span className="text-gray-700">{b.code}</span> */}
              </button>
            ))}
          </div>
          {helperText && !error && (
            <p className="mt-2 text-xs text-gray-500 px-1">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

BankSelect.displayName = 'BankSelect';

import { meses } from '@/helpers/enum';
import { useState, useRef, useEffect, HTMLAttributes } from 'react';

interface MonthGridDropdownProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
}

export function MonthGridDropdown({
  value,
  onChange,
  placeholder,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  ...rest
}: MonthGridDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`relative inline-block ${className}`}
      ref={containerRef}
      {...rest}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`px-3 py-2 border rounded w-24 text-center bg-[#ffffe4] hover:bg-gray-50 text-sm ${buttonClassName}`}
      >
        {value
          ? meses.find((m) => m.value === value)?.label
          : placeholder || 'Mes'}
      </button>

      {open && (
        <div
          className={`absolute bg-[#ffffe4] shadow-lg rounded mt-1 p-2 grid grid-cols-4 gap-1 z-20 w-48 max-h-60 overflow-y-auto border border-gray-400 ${dropdownClassName}`}
        >
          {meses.map((m) => (
            <button
              key={m.value}
              type="button"
              className={`w-10 h-8 flex items-center justify-center text-sm rounded hover:bg-gray-200 focus:outline-none ${
                value === m.value ? 'bg-teal-100' : ''
              }`}
              onClick={() => {
                onChange(m.value);
                setOpen(false);
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

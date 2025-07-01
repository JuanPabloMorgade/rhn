import { useState, useRef, useEffect, HTMLAttributes } from 'react';

interface DayGridDropdownProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  maxDays?: number;
  daysList?: string[];
  disabled?: boolean;
}

export function DayGridDropdown({
  value,
  onChange,
  placeholder,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  maxDays = 31,
  daysList,
  disabled = false,
  ...rest
}: DayGridDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled && value) {
      onChange('');
    }
  }, [disabled]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const days = daysList
    ? daysList
    : Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, '0'));

  const toggleOpen = () => {
    if (!disabled) setOpen((o) => !o);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      ref={containerRef}
      {...rest}
    >
      <button
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        className={
          `px-3 py-2 border rounded w-32 text-center bg-[#ffffe4] text-sm ` +
          `${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
          } ` +
          buttonClassName
        }
      >
        {value || placeholder || '—'}
      </button>

      {open && !disabled && (
        <div
          className={
            `absolute bg-[#ffffe4] shadow-lg rounded mt-1 p-2 grid grid-cols-7 gap-1 z-20 ` +
            `w-56 max-h-60 overflow-y-auto border border-gray-400 ` +
            dropdownClassName
          }
        >
          {days.map((day) => (
            <button
              key={day}
              type="button"
              className={
                `w-8 h-8 flex items-center justify-center text-sm rounded ` +
                `hover:bg-gray-200 focus:outline-none ${
                  value === day ? 'bg-teal-100' : ''
                }`
              }
              onClick={() => {
                onChange(day);
                setOpen(false);
              }}
            >
              {day}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

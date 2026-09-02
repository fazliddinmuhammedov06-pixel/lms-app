import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface CustomSelectProps<T> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: Array<{ value: T; label: string }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect<T>({
  value,
  onChange,
  options,
  placeholder = 'Выберите...',
  className = '',
  disabled = false,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLUListElement>(null);

  // Find highlighted index based on value
  useEffect(() => {
    if (value === null) {
      setHighlightedIndex(-1);
      return;
    }
    const index = options.findIndex((opt) => opt.value === value);
    setHighlightedIndex(index);
  }, [value, options]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOption = (option: { value: T; label: string }) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        selectRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev >= options.length - 1 ? 0 : prev + 1
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelectOption(options[highlightedIndex]);
        }
        break;
      default:
        break;
    }
  };

  const getOptionProps = (index: number, option: { value: T; label: string }) => {
    const isSelected = option.value === value;
    const isHighlighted = index === highlightedIndex;

    return {
      className: cn(
        'select-option',
        'px-4 py-2 cursor-pointer',
        isSelected ? 'bg-slate-800/50' : '',
        isHighlighted ? 'bg-slate-600/50' : '',
        !isSelected && !isHighlighted ? 'hover:bg-slate-600/30' : '',
        'transition-colors duration-150'
      ),
      onClick: () => handleSelectOption(option),
      onMouseEnter: () => setHighlightedIndex(index),
    };
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      ref={selectRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative',
        'w-full',
        'select-none',
        className,
        disabled ? 'opacity-50 pointer-events-none' : ''
      )}
    >
      <div
        className={cn(
          'select-trigger',
          'w-full px-4 py-3 text-left',
          'border border-slate-600',
          'bg-[#0f172a]',
          'text-[#f8fafc]',
          'rounded-sm',
          'flex',
          'items-center',
          'justify-between',
          'transition-colors',
          'duration-200',
          'hover:border-orange-500',
          'focus:outline-none',
          'focus:border-orange-500',
          'focus:ring-2',
          'focus:ring-orange-500/50',
          disabled ? 'opacity-50' : ''
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className="w-4 h-4 text-slate-400 transition-transform duration-200"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>

      {isOpen && (
        <ul
          ref={optionsRef}
          className={cn(
            'select-menu',
            'absolute',
            'z-50',
            'mt-1',
            'w-full',
            'max-h-[200px]',
            'overflow-y-auto',
            'border',
            'border-slate-600',
            'bg-[#0f172a]',
            'rounded-sm',
            'shadow-lg',
            'shadow-black/20',
            'py-1'
          )}
        >
          {options.map((option, index) => (
            <li
              key={String(option.value)}
              {...getOptionProps(index, option)}
              className="select-option-item"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
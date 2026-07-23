import * as React from 'react';
import { cn } from '@/lib/utils';

interface BaseProps {
  label?: string;
  helperText?: string;
  error?: string | null;
  containerClassName?: string;
  requiredIndicator?: boolean; // show * when required
  fullWidth?: boolean;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & BaseProps;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      helperText,
      error,
      requiredIndicator,
      fullWidth = true,
      id,
      type = 'text',
      disabled,
      ...rest
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasFloating = !!label; // only render floating label when label provided
    const describedBy = helperText || error ? `${inputId}-desc` : undefined;

    return (
      <div className={cn(fullWidth && 'w-full', 'relative', containerClassName)}>
        <input
          id={inputId}
          ref={ref}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
          type={type}
          disabled={disabled}
          className={cn(
            'peer flex h-12 rounded-lg border bg-gray-50 px-3 pt-3 text-md font-medium text-gray-900 placeholder-transparent focus:outline-none transition-colors',
            'border-[#b6c2cc] focus:border-primary',
            error && 'border-red-500 focus:border-red-500',
            disabled && 'opacity-60 cursor-not-allowed',
            fullWidth ? 'w-full' : 'w-auto',
            className,
          )}
          placeholder={hasFloating ? ' ' : label || rest.placeholder}
          {...rest}
        />
        {hasFloating && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-7 -top-2 bg-gray-50 px-1 text-md font-medium text-gray-900 cursor-text transition-all duration-200',
              'peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-md',
              'peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary',
              error && 'text-red-600 peer-focus:text-red-600',
            )}
          >
            {label}
            {requiredIndicator && rest.required && <span className="ml-0.5 text-red-600">*</span>}
          </label>
        )}
        {(helperText || error) && (
          <p
            id={describedBy}
            className={cn(
              'mt-1 text-xs',
              error ? 'text-red-600' : 'text-gray-500',
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

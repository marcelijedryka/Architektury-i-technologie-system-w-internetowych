import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, required, id, ...props }, ref) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">
        {label} {required && <span className="text-red-500" aria-label="wymagane">*</span>}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`rounded border px-3 py-2 text-sm bg-[var(--bg)] text-[var(--text)] border-[var(--border)]
          focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
          ${error ? 'border-red-500' : ''}`}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && <span id={`${inputId}-error`} role="alert" className="text-xs text-red-500">{error}</span>}
    </div>
  )
})
Input.displayName = 'Input'

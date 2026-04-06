import { useState, useRef, useEffect } from 'react'

export interface ComboboxOption {
  value: string
  label: string
}

interface Props {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  id?: string
}

export function Combobox({ options, value, onChange, placeholder, label, required, disabled, id }: Props) {
  const selectedLabel = options.find(o => o.value === value)?.label ?? ''
  const [inputText, setInputText] = useState(selectedLabel)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync display text when value changes externally (e.g. parent resets)
  useEffect(() => {
    setInputText(options.find(o => o.value === value)?.label ?? '')
  }, [value, options])

  const filtered = inputText
    ? options.filter(o => o.label.toLowerCase().includes(inputText.toLowerCase()))
    : options

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (opt: ComboboxOption) => {
    setInputText(opt.label)
    onChange(opt.value)
    setOpen(false)
  }

  const handleInput = (text: string) => {
    setInputText(text)
    setOpen(true)
    // If text was cleared, clear selection
    if (!text) onChange('')
    // If exact match (case-insensitive), auto-select it
    const exact = options.find(o => o.label.toLowerCase() === text.toLowerCase())
    if (exact) onChange(exact.value)
  }

  const handleBlur = () => {
    // Small delay so click on option fires first
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setOpen(false)
        // If text doesn't match any option, clear
        const match = options.find(o => o.label.toLowerCase() === inputText.toLowerCase())
        if (!match) { setInputText(''); onChange('') }
        else setInputText(match.label)
      }
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
    if (e.key === 'ArrowDown' && filtered.length > 0) {
      e.preventDefault()
      setOpen(true)
    }
  }

  const baseInput = 'w-full rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm px-3 py-2 focus:border-[var(--accent)] focus:outline-none disabled:opacity-50'

  return (
    <div ref={containerRef} className="flex flex-col gap-1 relative">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--text)]">
          {label}{required && <span className="text-red-500 ml-1" aria-label="wymagane">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={inputText}
        onChange={e => handleInput(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className={baseInput}
        aria-autocomplete="list"
        aria-expanded={open}
        role="combobox"
        aria-controls={id ? `${id}-listbox` : undefined}
      />
      {open && filtered.length > 0 && (
        <ul
          id={id ? `${id}-listbox` : undefined}
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded border border-[var(--border)] bg-[var(--bg)] shadow-lg"
        >
          {filtered.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onMouseDown={() => select(opt)}
              className={`px-3 py-2 text-sm cursor-pointer
                ${opt.value === value
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text)] hover:bg-[var(--surface)]'
                }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
};

export function SelectField({
  id,
  label,
  options,
  placeholder,
  className = "",
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="flex flex-col gap-2 text-sm text-foreground/80">
      <span className="font-medium text-foreground">{label}</span>
      <select
        id={fieldId}
        className={`rounded-xl border border-brand/20 bg-white/80 px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-[var(--ring)] ${className}`}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

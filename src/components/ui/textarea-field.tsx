import type { TextareaHTMLAttributes } from "react";

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function TextareaField({
  id,
  label,
  className = "",
  ...props
}: TextareaFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="flex flex-col gap-2 text-sm text-foreground/80">
      <span className="font-medium text-foreground">{label}</span>
      <textarea
        id={fieldId}
        className={`min-h-24 rounded-xl border border-brand/20 bg-white/80 px-4 py-3 text-foreground outline-none transition placeholder:text-foreground/40 focus:border-brand focus:ring-2 focus:ring-[var(--ring)] ${className}`}
        {...props}
      />
    </label>
  );
}

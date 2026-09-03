export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text-dark mb-1.5">
        {label}
        {required && <span className="text-red ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-10 px-3 rounded-lg border border-border-light bg-card text-sm text-text-dark placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 rounded-lg border border-border-light bg-card text-sm text-text-dark placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
    />
  );
}

export function SelectField({
  label,
  required,
  options,
  placeholder,
  ...props
}: { label: string; required?: boolean; options: string[]; placeholder?: string } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "placeholder">) {
  return (
    <Field label={label} required={required}>
      <select
        {...props}
        className="w-full h-10 px-3 rounded-lg border border-border-light bg-card text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      >
        {placeholder && <option value="" disabled selected={props.value === ""}>{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
}

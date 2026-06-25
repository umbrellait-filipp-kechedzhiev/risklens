import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "inverse" }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-primary text-white hover:bg-accent",
        variant === "secondary" && "border border-border bg-white text-foreground hover:border-primary/40 hover:bg-blue-50",
        variant === "ghost" && "text-muted hover:bg-blue-50 hover:text-primary",
        variant === "inverse" && "bg-white text-primary hover:bg-blue-50",
        className
      )}
      {...props}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="focus-ring h-10 w-full rounded-lg border border-border bg-white px-3 text-sm shadow-subtle" {...props} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="focus-ring min-h-24 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-subtle" {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="focus-ring h-10 w-full rounded-lg border border-border bg-white px-3 text-sm shadow-subtle" {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-border bg-white p-5 shadow-subtle", className)} {...props} />;
}

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize", className)} {...props} />;
}

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      {label}
      {children}
      {error ? <span className="text-xs font-normal text-red-700">{error}</span> : null}
    </label>
  );
}

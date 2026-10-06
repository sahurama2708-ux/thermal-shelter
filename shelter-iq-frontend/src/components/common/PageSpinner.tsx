import Logo from "./Logo";

export default function PageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-sky">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary-400" />
        <Logo size={40} showWordmark={false} />
      </div>
      <p className="text-sm font-medium text-ink-400">{label}</p>
    </div>
  );
}

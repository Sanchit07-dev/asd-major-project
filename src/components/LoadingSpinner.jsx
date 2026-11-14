/**
 * Lightweight accessible loading indicator used across all Supabase fetch pages.
 * Replaces ad-hoc pulse skeletons with a consistent branded spinner.
 */
export default function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3 py-16 text-white/60">
      <span
        className="block h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-amber"
        aria-hidden="true"
      />
      <span className="text-sm">{message}</span>
    </div>
  )
}

export default function StarRating({ value = 0, onChange, size = 'text-xl' }) {
  const filled = Math.round(Number(value))
  return (
    <span className={size} role={onChange ? 'group' : 'img'} aria-label={onChange ? 'Your rating' : `${Number(value).toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button type="button" key={n} onClick={() => onChange(n)} aria-label={`${n} stars`} className={n <= filled ? 'text-pen' : 'text-rule'}>★</button>
        ) : (
          <span key={n} className={n <= filled ? 'text-pen' : 'text-rule'}>★</span>
        )
      )}
    </span>
  )
}

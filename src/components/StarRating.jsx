export default function StarRating({ value = 0, onChange, size = 'text-xl' }) {
  const rounded = Math.round(Number(value))
  return (
    <span className={`${size} select-none`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={onChange ? () => onChange(n) : undefined}
          className={`${n <= rounded ? 'text-yellow-400' : 'text-slate-600'} ${onChange ? 'cursor-pointer' : ''}`}
        >
          ★
        </span>
      ))}
    </span>
  )
}

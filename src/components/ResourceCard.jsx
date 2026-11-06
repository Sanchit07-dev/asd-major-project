import { Link } from 'react-router-dom'

export default function ResourceCard({ resource, subjectName }) {
  const n = resource.review_count
  return (
    <Link
      to={`/resource/${resource.id}`}
      className="-mx-2 grid grid-cols-[3.5rem_1fr] gap-4 border-b border-rule px-2 py-5 transition-colors hover:bg-white"
    >
      <div className="text-right">
        {n > 0 ? (
          <span className="mark text-2xl font-semibold">{Number(resource.avg_rating).toFixed(1)}</span>
        ) : (
          <span className="text-mute">New</span>
        )}
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug">{resource.title}</h3>
          <span className="shrink-0 rounded-sm border border-rule px-1.5 text-sm text-mute">{resource.type}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-mute">
          {subjectName && <span>{subjectName}</span>}
          <span>{n} {n === 1 ? 'review' : 'reviews'}</span>
        </div>
        {resource.description && (
          <p className="mt-2 line-clamp-2 max-w-prose font-read text-[0.95rem] leading-relaxed">{resource.description}</p>
        )}
      </div>
    </Link>
  )
}

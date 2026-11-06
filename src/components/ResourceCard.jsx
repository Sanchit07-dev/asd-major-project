import { Link } from 'react-router-dom'
import StarRating from './StarRating'

export default function ResourceCard({ resource, subjectName }) {
  return (
    <Link
      to={`/resource/${resource.id}`}
      className="block p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{resource.title}</h3>
        <span className="text-xs px-2 py-1 rounded bg-indigo-600 uppercase">{resource.type}</span>
      </div>
      <p className="text-sm text-slate-400 mt-1">{subjectName}</p>
      {resource.description && (
        <p className="text-sm text-slate-300 mt-2 line-clamp-2">{resource.description}</p>
      )}
      <div className="flex items-center gap-2 mt-3 text-sm">
        <StarRating value={resource.avg_rating} size="text-base" />
        <span className="text-slate-400">
          {Number(resource.avg_rating).toFixed(1)} ({resource.review_count})
        </span>
      </div>
    </Link>
  )
}


import { Link } from 'react-router-dom'

export default function ResourceCard({
  resource,
  subjectName,
  isBookmarked = false,
  isBookmarkLoading = false,
  onToggleBookmark,
}) {
  const n = resource.review_count

  const handleBookmarkClick = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (onToggleBookmark && !isBookmarkLoading) {
      onToggleBookmark(resource.id)
    }
  }

  return (
    <div className="group -mx-2 grid grid-cols-[3.5rem_1fr] gap-4 border-b border-rule px-2 py-5 transition-colors hover:bg-white relative">
      <div className="text-right">
        {n > 0 ? (
          <span className="mark text-2xl font-semibold">
            {Number(resource.avg_rating).toFixed(1)}
          </span>
        ) : (
          <span className="text-mute">New</span>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug group-hover:text-pen transition-colors">
            <Link
              to={`/resource/${resource.id}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-sm"
            >
              {resource.title}
            </Link>
          </h3>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-sm border border-rule px-1.5 text-sm text-mute uppercase font-mono text-xs">
              {resource.type}
            </span>

            {onToggleBookmark && (
              <button
                type="button"
                onClick={handleBookmarkClick}
                disabled={isBookmarkLoading}
                aria-label={
                  isBookmarked
                    ? `Remove ${resource.title} from saved resources`
                    : `Save ${resource.title} for later`
                }
                aria-pressed={isBookmarked}
                title={
                  isBookmarked
                    ? 'Remove from saved'
                    : 'Save for later'
                }
                className="p-1 rounded text-mute hover:text-amber transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber disabled:cursor-wait disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-5 h-5 ${
                    isBookmarked ? 'text-amber fill-amber' : ''
                  }`}
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-mute">
          {subjectName && (
            <span className="font-medium text-ink/80">
              {subjectName}
            </span>
          )}

          <span>
            {n} {n === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {resource.description && (
          <p className="mt-2 line-clamp-2 max-w-prose font-read text-[0.95rem] leading-relaxed text-mute">
            {resource.description}
          </p>
        )}
      </div>
    </div>
  )
}

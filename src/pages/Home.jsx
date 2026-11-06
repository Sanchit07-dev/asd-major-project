import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center text-white">
      <h1 className="text-4xl font-bold">NST Learning Hub</h1>
      <p className="mt-4 text-lg text-slate-300">
        Find, share, and rate the best learning resources for your syllabus,
        recommended by NST students.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/browse" className="px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-500">Browse resources</Link>
        <Link to="/add" className="px-5 py-2 rounded bg-slate-700 hover:bg-slate-600">Share a resource</Link>
      </div>
    </div>
  )
}

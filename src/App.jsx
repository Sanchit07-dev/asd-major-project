import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Browse from './pages/Browse'
import ResourceDetail from './pages/ResourceDetail'
import AddResource from './pages/AddResource'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
        <nav className="flex gap-4 p-4 text-slate-200 border-b border-slate-700">
          <Link to="/" className="font-bold text-white">NST Learning Hub</Link>
          <Link to="/browse">Browse</Link>
          <Link to="/add">Add Resource</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/login" className="ml-auto">Login</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/resource/:id" element={<ResourceDetail />} />
          <Route path="/add" element={<AddResource />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

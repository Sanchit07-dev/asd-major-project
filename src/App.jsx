import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Browse from './pages/Browse'
import ResourceDetail from './pages/ResourceDetail'
import AddResource from './pages/AddResource'
import Profile from './pages/Profile'

function Shell() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen">
      <Navbar />
      <div key={pathname} className="page-enter">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/resource/:id" element={<ResourceDetail />} />
          <Route path="/add" element={<ProtectedRoute><AddResource /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="splash" aria-hidden="true">
          <span className="text-3xl font-bold tracking-tight">NST Learning Hub</span>
          <span className="splash-bar" />
        </div>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  )
}

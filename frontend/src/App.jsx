import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import SubmitBug from './pages/SubmitBug.jsx'
import Results from './pages/Results.jsx'
import Dashboard from './pages/Dashboard.jsx'
import About from './pages/About.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="submit" element={<SubmitBug />} />
        <Route path="results" element={<Results />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}

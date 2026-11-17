import { useEffect } from 'react'
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Fan from './pages/Fan'
import Agent from './pages/Agent'
import Partner from './pages/Partner'
import { Page } from './components/Layout'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const NotFound = () => (
  <Page hero={<p className="m-0">Nothing here. <Link to="/" className="underline">Back to the start</Link>.</p>} art={48}>
    <div className="px-4 py-10 md:px-6">404</div>
  </Page>
)

// HashRouter so deep links work on GitHub Pages without server rewrites.
export default function App() {
  return (
    <HashRouter>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/fan" element={<Fan />} />
        <Route path="/agent" element={<Agent />} />
        <Route path="/partner" element={<Partner />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  )
}

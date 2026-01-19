import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'
import DownloadPage from './DownloadPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/image/:id" element={<DownloadPage />} />
      </Routes>
    </Router>
  )
}

export default App

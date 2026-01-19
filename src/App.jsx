import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'
import DownloadPage from './DownloadPage'
import UploadPage from './UploadPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/image/:id" element={<DownloadPage />} />
      </Routes>
    </Router>
  )
}

export default App

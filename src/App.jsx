import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import StudentTest from './pages/StudentTest.jsx'
import TeacherArea from './pages/TeacherArea.jsx'

export default function App() {
  return (
    <div className="appShell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teste" element={<StudentTest />} />
        <Route path="/professor" element={<TeacherArea />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

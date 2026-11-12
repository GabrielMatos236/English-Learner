import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import StudentHub from './pages/StudentHub.jsx'
import StudentTest from './pages/StudentTest.jsx'
import Practice from './pages/Practice.jsx'
import TeacherArea from './pages/TeacherArea.jsx'

export default function App() {
  return (
    <div className="appShell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aluno" element={<StudentHub />} />
        <Route path="/teste" element={<StudentTest />} />
        <Route path="/pratica" element={<Practice />} />
        <Route path="/pratica/:studentId" element={<Practice />} />
        <Route path="/professor" element={<TeacherArea />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

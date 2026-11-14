import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Missions from './pages/Missions'
import MissionDetails from './pages/MissionDetails'
import Planner from './pages/Planner'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/missions/:id" element={<MissionDetails />} />
        <Route path="/planner" element={<Planner />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
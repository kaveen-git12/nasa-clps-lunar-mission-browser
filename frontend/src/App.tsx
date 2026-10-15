import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Missions from './pages/Missions'
import AddMission from './pages/AddMission'
import MissionDetails from './pages/MissionDetails'
import Planner from './pages/Planner'
import Visualization from './pages/Visualization'
import LunarMap from './pages/LunarMap'
import Resources from './pages/Resources'
import Settings from './pages/Settings'
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
        <Route path="/missions/add" element={<AddMission />} />
        <Route path="/missions/:id" element={<MissionDetails />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/visualization" element={<Visualization />} />
        <Route path="/lunar-map" element={<LunarMap />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './componets/Dashboard'
import LandingPage from './componets/LandingPage'
import Navbar from './componets/Navbar'
import Login from './componets/Login'
import Browse from './componets/Browse'
import AddItem from './componets/AddItem'


function App() {
  return (
   <div>
    {/* define all route here */}
     <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/" element={<LandingPage/>} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
   </div>
  )
}

export default App
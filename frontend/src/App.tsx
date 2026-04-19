import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home/Home'
import Stock from './pages/Stock/Stock'
import Screener from './pages/Screener/Screener'
import Compare from './pages/Compare/Compare'
import Glossary from './pages/Glossary/Glossary'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Profile from './pages/Profile/Profile'
import Favorites from './pages/Favorites/Favorites'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="stocks/:ticker" element={<Stock />} />
        <Route path="screener" element={<Screener />} />
        <Route path="compare" element={<Compare />} />
        <Route path="glossary" element={<Glossary />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="favorites" element={<Favorites />} />
      </Route>
    </Routes>
  )
}

export default App
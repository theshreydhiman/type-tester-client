import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TestSettingsProvider } from './context/TestSettingsContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <TestSettingsProvider>
        <BrowserRouter>
          <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TestSettingsProvider>
    </AuthProvider>
  );
}

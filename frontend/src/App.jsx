import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Activate from './components/Activate'; 
import AdminPanel from './components/AdminPanel';

function App() {
  const isAuthenticated = false; 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/activate/:token" element={<Activate />} />

        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <AdminPanel />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Chat from './pages/Chat';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
};

const AppRoutes = () => {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Navbar />
            <div className="container mx-auto p-4">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/:id" element={<ServiceDetails />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <AdminRoute>
                            <Admin />
                        </AdminRoute>
                    } />
                    <Route path="/chat/:requestId" element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
};

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;

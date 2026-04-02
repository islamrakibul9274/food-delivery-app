import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const location = useLocation();
    
    // 1. Get user data synchronously during the first render
    const userInfo = localStorage.getItem('user-info');
    const user = userInfo ? JSON.parse(userInfo) : null;

    // 2. Immediate check: No "isLoading" state or useEffect needed!
    if (user && user.role === 'admin') {
        return children;
    }

    // 3. Redirect if not authorized
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default AdminRoute;
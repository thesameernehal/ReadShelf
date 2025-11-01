// client/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// NOTE: import path matches the file you showed earlier (Authcontext.jsx)
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext) || {}; // safe even if context is undefined
    const token = localStorage.getItem('token');
    const rawLocalUser = localStorage.getItem('user');

    // debug logs — copy & paste these exact lines from browser console for me
    console.log('🔎 ProtectedRoute debug - context user:', user);
    console.log('🔎 ProtectedRoute debug - localStorage.user:', rawLocalUser);
    console.log('🔎 ProtectedRoute debug - localStorage.token:', token);

    // decide auth: true if either context has a user with token OR localStorage has token
    const hasContextUser = !!(user && user.token);
    const hasLocalToken = !!token;

    const isAuthenticated = hasContextUser || hasLocalToken;

    if (!isAuthenticated) {
        // keep the current location so we can return after login if desired
        const location = useLocation();
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;

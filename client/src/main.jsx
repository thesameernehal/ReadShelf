import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';   // ✅ added

// ✅ Utility to safely read stored token
function getStoredToken() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return localStorage.getItem('token') || null;
    const parsed = JSON.parse(raw);
    return parsed?.token || parsed?.jwt || localStorage.getItem('token') || null;
  } catch {
    return localStorage.getItem('token') || null;
  }
}

// ✅ Set axios default Authorization header at startup
const _token = getStoredToken();
if (_token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${_token}`;
  console.log('🔐 Axios default token set:', _token.slice(0, 20) + '...');
} else {
  delete axios.defaults.headers.common['Authorization'];
  console.log('⚠️ No stored token found — requests will be unauthenticated until login.');
}

// ✅ Optional helper to update token dynamically after login/logout
export function setAxiosAuthToken(token) {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete axios.defaults.headers.common['Authorization'];
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <ToastContainer position="top-right" />
    </AuthProvider>
  </React.StrictMode>
);

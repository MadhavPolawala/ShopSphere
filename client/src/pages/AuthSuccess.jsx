import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserInfo } = useContext(AuthContext);
  const processed = useRef(false);

  useEffect(() => {
    // Prevent double-execution in React StrictMode
    if (processed.current) return;
    processed.current = true;

    const params = new URLSearchParams(location.search);
    const googleToken = params.get('token');

    if (!googleToken) {
      toast.error('Authentication failed: No token received');
      navigate('/login', { replace: true });
      return;
    }

    // Exchange the Google OAuth token for a standard login response
    const exchangeToken = async () => {
      try {
        const { data } = await API.post('/users/google-login', { token: googleToken });

        // data has the same shape as normal login: { _id, name, email, ..., token }
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        setUserInfo(data);
        toast.success('Successfully logged in with Google!');
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Google login exchange failed:', err.response?.data || err.message);
        toast.error(err.response?.data?.message || 'Google login failed');
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    };

    exchangeToken();
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authenticating...</h2>
      <p className="text-gray-500 dark:text-gray-400">Please wait while we complete your sign-in.</p>
    </div>
  );
};

export default AuthSuccess;

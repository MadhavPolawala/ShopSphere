import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loadUser } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      loadUser().then(() => {
        toast.success('Successfully logged in with Google!');
        navigate('/', { replace: true });
      });
    } else {
      toast.error('Authentication failed');
      navigate('/login', { replace: true });
    }
  }, [location, navigate, loadUser]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authenticating...</h2>
      <p className="text-gray-500 dark:text-gray-400">Please wait while we complete your sign-in.</p>
    </div>
  );
};

export default AuthSuccess;

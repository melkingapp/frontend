import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, forceLogout } from '../../features/authentication/authSlice';

const AuthMonitor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useSelector(state => state.auth);

    useEffect(() => {
        const checkAuthStatus = () => {
            // Check if tokens exist in localStorage
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');

            // If user should be authenticated but tokens are missing
            if (isAuthenticated && (!accessToken || !refreshToken)) {
                dispatch(forceLogout());
                navigate('/login', { replace: true });
                return;
            }

            // If user is not authenticated but has tokens, try to validate
            if (!isAuthenticated && accessToken && refreshToken) {
                validateToken(accessToken);
            }
        };

        const validateToken = async (token) => {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const exp = payload.exp * 1000;
                const now = Date.now();
                
                if (exp < now) {
                    dispatch(forceLogout());
                    navigate('/login', { replace: true });
                } else {
                    // Token is valid but user is not authenticated in Redux
                    // This might happen after page refresh
                    // We could dispatch a re-authentication action here if needed
                }
            } catch (error) {
                dispatch(forceLogout());
                navigate('/login', { replace: true });
            }
        };

        // Check auth status immediately
        checkAuthStatus();

        // Set up interval to check auth status periodically
        const interval = setInterval(checkAuthStatus, 60000); // Check every minute

        // Check auth status when location changes
        const unlisten = () => {
            checkAuthStatus();
        };

        return () => {
            clearInterval(interval);
            unlisten();
        };
    }, [dispatch, navigate, isAuthenticated, user, location.pathname]);

    // Monitor for 401 errors from API calls
    useEffect(() => {
        const handleUnauthorized = (event) => {
            if (event.detail && event.detail.status === 401) {
                dispatch(forceLogout());
                navigate('/login', { replace: true });
            }
        };

        window.addEventListener('api-unauthorized', handleUnauthorized);
        
        return () => {
            window.removeEventListener('api-unauthorized', handleUnauthorized);
        };
    }, [dispatch, navigate]);

    // Don't render anything, this is just a monitoring component
    return null;
};

export default AuthMonitor;

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, forceLogout } from '../../features/authentication/authSlice';
import { getProfile } from '../../shared/services/profileService';

const AuthMonitor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useSelector(state => state.auth);

    useEffect(() => {
        const verifySessionWithServer = async () => {
            if (!isAuthenticated) return;
            try {
                await getProfile();
                console.log('✅ Server-side session verification passed');
            } catch (serverError) {
                const status = serverError.response?.status;
                if (status === 401 || status === 403) {
                    console.log('❌ Server rejected session, force logging out...');
                    dispatch(forceLogout());
                    navigate('/login', { replace: true });
                }
            }
        };

        // Perform server-side validation strictly once upon component mount (when auth is true)
        verifySessionWithServer();

        const checkAuthStatus = () => {
            // Check if tokens exist in localStorage
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            
            console.log('🔍 Auth status check:', {
                isAuthenticated,
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
                user: user?.username,
                currentPath: location.pathname
            });

            // If user should be authenticated but tokens are missing
            if (isAuthenticated && (!accessToken || !refreshToken)) {
                console.log('⚠️ User marked as authenticated but tokens missing, force logging out...');
                dispatch(forceLogout());
                navigate('/login', { replace: true });
                return;
            }

            // If user is not authenticated but has tokens, try to validate
            if (!isAuthenticated && accessToken && refreshToken) {
                console.log('🔄 User not authenticated but has tokens, checking token validity...');
                validateToken(accessToken);
            }
        };

        const validateToken = async (token) => {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const exp = payload.exp * 1000;
                const now = Date.now();
                
                if (exp < now) {
                    console.log('❌ Token expired, force logging out...');
                    dispatch(forceLogout());
                    navigate('/login', { replace: true });
                } else {
                    console.log('✅ Token is valid');
                    // Token is valid but user is not authenticated in Redux
                    // This might happen after page refresh
                    // We could dispatch a re-authentication action here if needed
                }
            } catch (error) {
                console.error('❌ Invalid token format:', error);
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
                console.log('🚨 401 Unauthorized detected, force logging out...');
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

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, forceLogout, fetchUserProfile } from '../../features/authentication/authSlice';

const AuthMonitor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useSelector(state => state.auth);
    // Use a ref to track if we've already verified the session on mount
    const hasVerifiedSession = useRef(false);

    // Verify session with server on initial mount if authenticated
    useEffect(() => {
        const verifySession = async () => {
            if (isAuthenticated && !hasVerifiedSession.current) {
                console.log('🛡️ Sentinel: Verifying hydrated session with server...');
                hasVerifiedSession.current = true;
                try {
                    // Try to fetch user profile to verify token is valid on server
                    await dispatch(fetchUserProfile()).unwrap();
                    console.log('✅ Sentinel: Session verified with server');
                } catch (error) {
                    console.warn('❌ Sentinel: Session invalid on server (Fake Auth or Expired), logging out...', error);
                    dispatch(forceLogout());
                    navigate('/login', { replace: true });
                }
            }
        };

        verifySession();
    }, [dispatch, navigate, isAuthenticated]);

    useEffect(() => {
        const checkAuthStatus = () => {
            // Check if tokens exist in localStorage
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            
            // Only log if something is interesting to avoid console spam
            if (!isAuthenticated && accessToken && refreshToken) {
                 console.log('🔄 User not authenticated but has tokens, checking token validity...');
                 validateToken(accessToken);
            }

            // If user should be authenticated but tokens are missing
            if (isAuthenticated && (!accessToken || !refreshToken)) {
                console.log('⚠️ User marked as authenticated but tokens missing, force logging out...');
                dispatch(forceLogout());
                navigate('/login', { replace: true });
                return;
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
                    // console.log('✅ Token is valid structure');
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

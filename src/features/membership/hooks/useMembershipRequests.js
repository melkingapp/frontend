import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembershipRequests } from '../membershipSlice';
import { selectMembershipState } from '../membershipSlice';

export const useMembershipRequests = (filterParams = {}) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const {
    requests,
    loadingStates,
    error,
    count,
  } = useSelector(selectMembershipState);

  const memoizedParams = JSON.stringify(filterParams);

  useEffect(() => {
    // Construct params for the thunk based on user role and filters
    const params = { ...JSON.parse(memoizedParams) };
    if (user?.role === 'owner' && !params.status) {
      params.owner_id = user.id;
    }
    
    dispatch(fetchMembershipRequests(params));
    
  }, [dispatch, user, memoizedParams]);

  const handleRefresh = () => {
    const params = { ...JSON.parse(memoizedParams) };
    if (user?.role === 'owner' && !params.status) {
      params.owner_id = user.id;
    }
    dispatch(fetchMembershipRequests(params));
  };

  return {
    requests,
    loading: loadingStates.requests,
    error,
    count,
    handleRefresh,
  };
};

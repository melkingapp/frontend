// Examples of how to use the new API integration in React components

import { useDispatch, useSelector } from 'react-redux';
import { 
  loginUser, 
  registerUser, 
  fetchUserProfile,
  logout 
} from '../../features/authentication/authSlice';
import { 
  fetchBuildings, 
  createBuilding, 
  updateBuilding,
  deleteBuilding,
  fetchBuildingDetails,
  fetchBuildingUnits,
  createUnit,
  updateUnit,
  deleteUnit
} from '../../features/manager/building/buildingSlice';
import { 
  fetchFinancialSummary,
  fetchTransactions,
  registerExpense,
  payBill,
  fetchExpenseTypes
} from '../../features/manager/finance/store/slices/financeSlice';
import { 
  fetchBuildingLetters,
  createLetter,
  updateLetter,
  deleteLetter
} from '../../features/manager/notification/slices/lettersSlice';
import { 
  fetchBuildingServices,
  createService,
  updateService,
  deleteService
} from '../../features/manager/notification/slices/servicesSlice';
import { 
  fetchBuildingSurveys,
  createSurvey,
  submitSurveyResponse,
  fetchSurveyResponses
} from '../../features/manager/notification/slices/surveysSlice';

// Example 1: Authentication
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector(state => state.auth);

  const login = async (credentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await dispatch(registerUser(userData)).unwrap();
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const loadProfile = async () => {
    try {
      await dispatch(fetchUserProfile()).unwrap();
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: logoutUser,
    loadProfile
  };
};

// Example 2: Buildings Management
export const useBuildings = () => {
  const dispatch = useDispatch();
  const { data: buildings, loading, error, selectedBuildingId } = useSelector(state => state.building);

  const loadBuildings = async () => {
    try {
      await dispatch(fetchBuildings()).unwrap();
    } catch (error) {
      console.error('Failed to load buildings:', error);
    }
  };

  const createNewBuilding = async (buildingData) => {
    try {
      const result = await dispatch(createBuilding(buildingData)).unwrap();
      return result;
    } catch (error) {
      console.error('Failed to create building:', error);
      throw error;
    }
  };

  const updateExistingBuilding = async (buildingId, buildingData) => {
    try {
      await dispatch(updateBuilding({ buildingId, buildingData })).unwrap();
    } catch (error) {
      console.error('Failed to update building:', error);
      throw error;
    }
  };

  const deleteExistingBuilding = async (buildingId) => {
    try {
      await dispatch(deleteBuilding(buildingId)).unwrap();
    } catch (error) {
      console.error('Failed to delete building:', error);
      throw error;
    }
  };

  const loadBuildingDetails = async (buildingId) => {
    try {
      await dispatch(fetchBuildingDetails(buildingId)).unwrap();
    } catch (error) {
      console.error('Failed to load building details:', error);
    }
  };

  return {
    buildings,
    loading,
    error,
    selectedBuildingId,
    loadBuildings,
    createBuilding: createNewBuilding,
    updateBuilding: updateExistingBuilding,
    deleteBuilding: deleteExistingBuilding,
    loadBuildingDetails
  };
};

// Example 3: Finance Management
export const useFinance = () => {
  const dispatch = useDispatch();
  const { 
    financialSummary, 
    transactions, 
    expenseTypes, 
    loading, 
    error 
  } = useSelector(state => state.finance);

  const loadFinancialSummary = async (buildingId) => {
    try {
      await dispatch(fetchFinancialSummary({ buildingId })).unwrap();
    } catch (error) {
      console.error('Failed to load financial summary:', error);
    }
  };

  const loadTransactions = async (filters = {}) => {
    try {
      await dispatch(fetchTransactions(filters)).unwrap();
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const createExpense = async (expenseData) => {
    try {
      await dispatch(registerExpense(expenseData)).unwrap();
    } catch (error) {
      console.error('Failed to create expense:', error);
      throw error;
    }
  };

  const payBillTransaction = async (paymentData) => {
    try {
      await dispatch(payBill(paymentData)).unwrap();
    } catch (error) {
      console.error('Failed to pay bill:', error);
      throw error;
    }
  };

  const loadExpenseTypes = async () => {
    try {
      await dispatch(fetchExpenseTypes()).unwrap();
    } catch (error) {
      console.error('Failed to load expense types:', error);
    }
  };

  return {
    financialSummary,
    transactions,
    expenseTypes,
    loading,
    error,
    loadFinancialSummary,
    loadTransactions,
    createExpense,
    payBill: payBillTransaction,
    loadExpenseTypes
  };
};

// Example 4: Notifications/Letters
export const useLetters = () => {
  const dispatch = useDispatch();
  const { letters, loading, error } = useSelector(state => state.letters);

  const loadBuildingLetters = async (buildingId) => {
    try {
      await dispatch(fetchBuildingLetters(buildingId)).unwrap();
    } catch (error) {
      console.error('Failed to load letters:', error);
    }
  };

  const createNewLetter = async (letterData) => {
    try {
      await dispatch(createLetter(letterData)).unwrap();
    } catch (error) {
      console.error('Failed to create letter:', error);
      throw error;
    }
  };

  const updateExistingLetter = async (letterId, letterData) => {
    try {
      await dispatch(updateLetter({ letterId, letterData })).unwrap();
    } catch (error) {
      console.error('Failed to update letter:', error);
      throw error;
    }
  };

  const deleteExistingLetter = async (letterId) => {
    try {
      await dispatch(deleteLetter(letterId)).unwrap();
    } catch (error) {
      console.error('Failed to delete letter:', error);
      throw error;
    }
  };

  return {
    letters,
    loading,
    error,
    loadBuildingLetters,
    createLetter: createNewLetter,
    updateLetter: updateExistingLetter,
    deleteLetter: deleteExistingLetter
  };
};

// Example 5: Services Management
export const useServices = () => {
  const dispatch = useDispatch();
  const { services, loading, error } = useSelector(state => state.services);

  const loadBuildingServices = async (buildingId) => {
    try {
      await dispatch(fetchBuildingServices(buildingId)).unwrap();
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const createNewService = async (buildingId, serviceData) => {
    try {
      await dispatch(createService({ buildingId, serviceData })).unwrap();
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error;
    }
  };

  const updateExistingService = async (buildingId, serviceId, serviceData) => {
    try {
      await dispatch(updateService({ buildingId, serviceId, serviceData })).unwrap();
    } catch (error) {
      console.error('Failed to update service:', error);
      throw error;
    }
  };

  const deleteExistingService = async (buildingId, serviceId) => {
    try {
      await dispatch(deleteService({ buildingId, serviceId })).unwrap();
    } catch (error) {
      console.error('Failed to delete service:', error);
      throw error;
    }
  };

  return {
    services,
    loading,
    error,
    loadBuildingServices,
    createService: createNewService,
    updateService: updateExistingService,
    deleteService: deleteExistingService
  };
};

// Example 6: Surveys Management
export const useSurveys = () => {
  const dispatch = useDispatch();
  const { surveys, loading, error } = useSelector(state => state.surveys);

  const loadBuildingSurveys = async (buildingId) => {
    try {
      await dispatch(fetchBuildingSurveys(buildingId)).unwrap();
    } catch (error) {
      console.error('Failed to load surveys:', error);
    }
  };

  const createNewSurvey = async (buildingId, surveyData) => {
    try {
      await dispatch(createSurvey({ buildingId, surveyData })).unwrap();
    } catch (error) {
      console.error('Failed to create survey:', error);
      throw error;
    }
  };

  const submitSurveyResponse = async (buildingId, surveyId, responses) => {
    try {
      await dispatch(submitSurveyResponse({ buildingId, surveyId, responses })).unwrap();
    } catch (error) {
      console.error('Failed to submit survey response:', error);
      throw error;
    }
  };

  const loadSurveyResponses = async (buildingId, surveyId) => {
    try {
      await dispatch(fetchSurveyResponses({ buildingId, surveyId })).unwrap();
    } catch (error) {
      console.error('Failed to load survey responses:', error);
    }
  };

  return {
    surveys,
    loading,
    error,
    loadBuildingSurveys,
    createSurvey: createNewSurvey,
    submitSurveyResponse,
    loadSurveyResponses
  };
};

// Example 7: Complete Component Usage
export const ExampleComponent = () => {
  const auth = useAuth();
  const buildings = useBuildings();
  const finance = useFinance();

  // Load data when component mounts
  React.useEffect(() => {
    if (auth.isAuthenticated) {
      buildings.loadBuildings();
      finance.loadExpenseTypes();
    }
  }, [auth.isAuthenticated]);

  const handleLogin = async (credentials) => {
    const success = await auth.login(credentials);
    if (success) {
      // Login successful, data will be loaded automatically
      console.log('User logged in successfully');
    }
  };

  const handleCreateBuilding = async (buildingData) => {
    try {
      await buildings.createBuilding(buildingData);
      console.log('Building created successfully');
    } catch (error) {
      console.error('Failed to create building:', error);
    }
  };

  return (
    <div>
      {/* Your component JSX here */}
    </div>
  );
};

# API Integration Documentation

This document describes the complete API integration between the frontend and backend of the Melking application.

## Overview

The frontend has been fully integrated with the Django REST API backend. All mock data has been replaced with real API calls, and the application now supports:

- JWT-based authentication
- Real-time data fetching and updates
- Error handling and loading states
- Token refresh functionality
- File uploads
- CRUD operations for all entities

## File Structure

```
frontend/src/
├── shared/
│   ├── services/
│   │   ├── api.js                 # Base API service
│   │   ├── authApi.js            # Authentication API
│   │   ├── buildingsApi.js       # Buildings API
│   │   ├── billingApi.js         # Finance/Billing API
│   │   ├── lettersApi.js         # Notifications/Letters API
│   │   ├── servicesApi.js        # Building Services API
│   │   └── surveysApi.js         # Surveys/Polls API
│   ├── config/
│   │   └── apiConfig.js          # API configuration and endpoints
│   └── examples/
│       └── apiUsageExamples.js   # Usage examples
├── features/
│   ├── authentication/
│   │   └── authSlice.js          # Updated with real API calls
│   ├── manager/
│   │   ├── building/
│   │   │   └── buildingSlice.js  # Updated with real API calls
│   │   ├── finance/
│   │   │   └── slices/
│   │   │       └── financeSlice.js # New finance slice
│   │   └── notification/
│   │       └── slices/
│   │           ├── lettersSlice.js   # New letters slice
│   │           ├── servicesSlice.js  # New services slice
│   │           └── surveysSlice.js   # New surveys slice
└── app/
    └── store.js                   # Updated with all slices
```

## API Services

### 1. Base API Service (`api.js`)

The base API service provides:
- HTTP methods (GET, POST, PUT, DELETE, PATCH)
- JWT token management
- Error handling
- File upload support
- Request/response interceptors

### 2. Authentication API (`authApi.js`)

Handles all authentication-related operations:
- User registration
- User login
- Token refresh
- Profile management
- Password changes

### 3. Buildings API (`buildingsApi.js`)

Manages building-related operations:
- Building registration
- Building CRUD operations
- Unit management
- Building details

### 4. Finance API (`billingApi.js`)

Handles financial operations:
- Expense registration
- Bill payments
- Financial summaries
- Transaction management
- Expense types

### 5. Letters API (`lettersApi.js`)

Manages notifications and letters:
- Letter creation and management
- Building notifications
- File attachments

### 6. Services API (`servicesApi.js`)

Handles building services:
- Service creation and management
- Service status updates
- Service types

### 7. Surveys API (`surveysApi.js`)

Manages surveys and polls:
- Survey creation and management
- Response submission
- Survey statistics
- Survey status management

## Redux Slices

Each API service has a corresponding Redux slice that manages:
- Loading states
- Error handling
- Data caching
- State updates

### Authentication Slice

```javascript
// Actions
loginUser(credentials)
registerUser(userData)
refreshToken(refreshToken)
fetchUserProfile()
updateUserProfile(profileData)
changePassword(passwordData)
logout()

// State
{
  user: { id, username, email, first_name, last_name, phone_number, role, is_active },
  tokens: { access, refresh },
  isAuthenticated: boolean,
  loading: boolean,
  error: string
}
```

### Building Slice

```javascript
// Actions
fetchBuildings(buildingId)
createBuilding(buildingData)
updateBuilding({ buildingId, buildingData })
deleteBuilding(buildingId)
fetchBuildingDetails(buildingId)
fetchBuildingUnits(buildingId)
createUnit({ buildingId, unitData })
updateUnit({ buildingId, unitId, unitData })
deleteUnit({ buildingId, unitId })

// State
{
  data: [], // Array of buildings
  units: {}, // Object with buildingId as key and units array as value
  selectedBuildingId: number,
  selectedBuilding: object,
  loading: boolean,
  error: string
}
```

## Usage Examples

### 1. Authentication

```javascript
import { useAuth } from '../shared/examples/apiUsageExamples';

const LoginComponent = () => {
  const { login, loading, error } = useAuth();

  const handleLogin = async (credentials) => {
    const success = await login(credentials);
    if (success) {
      // Redirect to dashboard
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Login form */}
    </form>
  );
};
```

### 2. Buildings Management

```javascript
import { useBuildings } from '../shared/examples/apiUsageExamples';

const BuildingsComponent = () => {
  const { 
    buildings, 
    loading, 
    loadBuildings, 
    createBuilding 
  } = useBuildings();

  useEffect(() => {
    loadBuildings();
  }, []);

  const handleCreateBuilding = async (buildingData) => {
    try {
      await createBuilding(buildingData);
      // Building created successfully
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {loading ? 'Loading...' : (
        <div>
          {buildings.map(building => (
            <div key={building.building_id}>
              {building.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 3. Finance Management

```javascript
import { useFinance } from '../shared/examples/apiUsageExamples';

const FinanceComponent = () => {
  const { 
    transactions, 
    financialSummary, 
    loadTransactions,
    createExpense 
  } = useFinance();

  useEffect(() => {
    loadTransactions({ building_id: 1 });
  }, []);

  const handleCreateExpense = async (expenseData) => {
    try {
      await createExpense(expenseData);
      // Expense created successfully
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {/* Finance UI */}
    </div>
  );
};
```

## Environment Configuration

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## Error Handling

The API integration includes comprehensive error handling:

1. **Network Errors**: Connection issues, timeouts
2. **HTTP Status Codes**: 400, 401, 403, 404, 500
3. **Validation Errors**: Field validation from backend
4. **Authentication Errors**: Token expiration, invalid credentials

All errors are properly caught and displayed to users with appropriate messages in Persian.

## Token Management

JWT tokens are automatically managed:

1. **Access Token**: Used for API requests (expires in 1 hour)
2. **Refresh Token**: Used to get new access tokens
3. **Automatic Refresh**: Tokens are refreshed automatically when needed
4. **Logout on Failure**: User is logged out if refresh fails

## Loading States

All API operations include loading states:

- `loading: true` during API calls
- `loading: false` when calls complete
- Loading indicators can be shown to users

## Data Caching

Redux state acts as a cache:

- Data is stored in Redux state after fetching
- Subsequent requests use cached data when available
- State is updated when data changes
- Data persists across component unmounts

## File Uploads

File uploads are supported for:

- Building attachments
- Letter attachments
- Expense receipts
- Survey attachments

Use the `uploadFile` method in the base API service:

```javascript
const formData = new FormData();
formData.append('file', file);
await api.uploadFile('/endpoint/', formData);
```

## Testing

To test the API integration:

1. Start the backend server: `python manage.py runserver`
2. Start the frontend: `npm run dev`
3. Test authentication, CRUD operations, and error handling
4. Check browser network tab for API calls
5. Verify data persistence and state management

## Migration from Mock Data

The migration from mock data to real API calls is complete:

- All mock data imports have been removed
- All API calls now use real endpoints
- Data structures match backend responses
- Error handling is properly implemented
- Loading states are managed correctly

## Backend Compatibility

The frontend is fully compatible with the Django REST API backend:

- All endpoints are correctly mapped
- Request/response formats match
- Authentication headers are properly set
- Error responses are handled correctly
- File uploads work as expected

## Performance Considerations

- API calls are debounced where appropriate
- Loading states prevent duplicate requests
- Error states are properly managed
- Token refresh is handled efficiently
- Data is cached in Redux state

## Security

- JWT tokens are stored securely in localStorage
- Tokens are automatically refreshed
- Sensitive data is not logged
- API endpoints are properly authenticated
- CORS is handled correctly

This integration provides a robust, scalable foundation for the Melking application with proper error handling, loading states, and user experience considerations.

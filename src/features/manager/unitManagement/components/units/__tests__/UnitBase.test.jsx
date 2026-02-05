import { render, screen } from '@testing-library/react';
import UnitBase from '../UnitBase';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock dependencies
jest.mock('lucide-react', () => ({
  HomeIcon: () => 'HomeIcon',
  HousePlus: () => 'HousePlus',
  Loader2: () => 'Loader2',
  RefreshCw: () => 'RefreshCw',
  Upload: () => 'Upload',
  Download: () => 'Download',
  Home: () => 'Home',
  Square: () => 'Square',
  Car: () => 'Car',
  Edit: () => 'Edit',
  CheckCircle2: () => 'CheckCircle2',
  XCircle: () => 'XCircle',
  CircleSlash: () => 'CircleSlash',
}));

jest.mock('moment-jalaali', () => {
  return {
    loadPersian: jest.fn(),
    format: jest.fn(() => '20230101'),
    jYear: jest.fn(() => 1402),
  };
});

// Mock slice
const mockUnitsReducer = (state = { units: [], loading: false, error: null }, action) => state;
const mockBuildingReducer = (state = { selectedBuildingId: 1, data: [] }, action) => state;

// Helper to render with store
const renderWithStore = (component, initialState = {}) => {
  const store = configureStore({
    reducer: {
      units: mockUnitsReducer,
      building: mockBuildingReducer,
      ...initialState
    }
  });
  return render(<Provider store={store}>{component}</Provider>);
};

describe('UnitBase', () => {
  it('renders without crashing', () => {
    renderWithStore(<UnitBase />);
    // The text is split by icon. So we use regex or getByRole heading
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/مدیریت واحدها/);
  });
});

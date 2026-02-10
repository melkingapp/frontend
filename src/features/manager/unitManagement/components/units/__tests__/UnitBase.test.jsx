import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnitBase from '../UnitBase';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUnits } from '../../../slices/unitsSlice';

// Mock dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../../slices/unitsSlice', () => ({
  fetchUnits: jest.fn(),
}));

jest.mock('../../../../../../shared/services/billingService', () => ({
  exportCompleteReports: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('moment-jalaali', () => {
    const moment = () => ({
        format: () => '2024-01-01',
        jYear: () => 1403,
    });
    moment.loadPersian = jest.fn();
    return moment;
});

// Mock child components
jest.mock('../UnitItem', () => ({ unit }) => <div data-testid="unit-item">{unit.unit_number || unit.units_id} - {unit.role}</div>);
jest.mock('../CreateUnitModal', () => () => <div data-testid="create-unit-modal" />);
jest.mock('../UnitDetailsModal', () => () => <div data-testid="unit-details-modal" />);
jest.mock('../../../../../buildings/components/BulkUnitImportModal', () => () => <div data-testid="bulk-import-modal" />);
jest.mock('../../../../building/buildingSlice', () => ({
  selectSelectedBuilding: (state) => state.building.data.find(b => b.building_id === state.building.selectedBuildingId),
}));

describe('UnitBase Component', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    mockDispatch.mockReturnValue(Promise.resolve({ payload: [] }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockState = {
      units: { units: [], loading: false, error: null },
      building: { selectedBuildingId: 1, data: [{ building_id: 1, title: 'Test Building' }] }
  };

  test('renders loading state correctly', () => {
    useSelector.mockImplementation((selector) => selector({
        ...mockState,
        units: { ...mockState.units, loading: true }
    }));

    render(<UnitBase buildingId={1} />);
    expect(screen.getByText(/در حال بارگذاری/i)).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    useSelector.mockImplementation((selector) => selector({
        ...mockState,
        units: { ...mockState.units, error: 'Failed to fetch' }
    }));

    render(<UnitBase buildingId={1} />);
    expect(screen.getByText(/خطا در بارگذاری واحدها/i)).toBeInTheDocument();
  });

  test('renders empty state correctly', () => {
    useSelector.mockImplementation((selector) => selector(mockState));

    render(<UnitBase buildingId={1} />);
    expect(screen.getByText(/واحدی موجود نیست/i)).toBeInTheDocument();
  });

  test('renders units grouped correctly (owners first, then tenants)', () => {
     const mockUnits = [
        { units_id: 1, unit_number: '101', role: 'tenant' }, // Tenant without owner in list
        { units_id: 2, unit_number: '102', role: 'owner' },  // Owner
        { units_id: 3, unit_number: '103', role: 'tenant' }, // Tenant 2
        { units_id: 4, unit_number: '102', role: 'tenant' }, // Tenant for unit 102 (should be grouped with owner)
    ];

    useSelector.mockImplementation((selector) => selector({
        ...mockState,
        units: { ...mockState.units, units: mockUnits }
    }));

    render(<UnitBase buildingId={1} />);

    const items = screen.getAllByTestId('unit-item');
    expect(items).toHaveLength(3);

    // Check order
    expect(items[0]).toHaveTextContent('102 - owner');
    expect(items[1]).toHaveTextContent('101 - tenant');
    expect(items[2]).toHaveTextContent('103 - tenant');
  });

  test('renders correct number of items when limit is provided', () => {
    const mockUnits = Array.from({ length: 10 }, (_, i) => ({
        units_id: i + 1,
        unit_number: `${i + 1}`,
        role: 'owner'
    }));

    useSelector.mockImplementation((selector) => selector({
        ...mockState,
        units: { ...mockState.units, units: mockUnits }
    }));

    render(<UnitBase buildingId={1} limit={5} />);

    const items = screen.getAllByTestId('unit-item');
    expect(items).toHaveLength(5);
    expect(screen.getByText(/نمایش 5 مورد از 10 واحد/i)).toBeInTheDocument();
  });
});

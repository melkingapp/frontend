import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UnitBase from '../UnitBase';
import * as reactRedux from 'react-redux';

// Mock dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../../slices/unitsSlice', () => ({
  fetchUnits: jest.fn(() => ({ type: 'units/fetchUnits', payload: [] })),
}));

jest.mock('../../../../building/buildingSlice', () => ({
  selectSelectedBuilding: jest.fn(),
}));

// Mock child components
jest.mock('../UnitItem', () => {
  return function MockUnitItem({ unit, onSelect }) {
    return (
      <div data-testid={`unit-item-${unit.units_id || unit.id}`} onClick={() => onSelect(unit)}>
        Unit {unit.unit_number} - {unit.role}
      </div>
    );
  };
});

jest.mock('../CreateUnitModal', () => () => <div data-testid="create-unit-modal" />);
jest.mock('../UnitDetailsModal', () => () => <div data-testid="unit-details-modal" />);
jest.mock('../../../../../buildings/components/BulkUnitImportModal', () => () => <div data-testid="bulk-import-modal" />);

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock moment-jalaali
jest.mock('moment-jalaali', () => {
  const m = () => ({
    jYear: () => 1403,
    format: () => '20240101',
  });
  m.loadPersian = jest.fn();
  return m;
});

describe('UnitBase Component', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    reactRedux.useDispatch.mockReturnValue(mockDispatch);
    mockDispatch.mockReturnValue(Promise.resolve({ payload: [] }));
  });

  const mockUnits = [
    { units_id: 1, unit_number: '101', role: 'owner', full_name: 'Owner 1' },
    { units_id: 2, unit_number: '102', role: 'tenant', full_name: 'Tenant 1' },
    { units_id: 3, unit_number: '101', role: 'tenant', full_name: 'Tenant of Owner 1' },
  ];

  it('renders loading state correctly', () => {
    reactRedux.useSelector.mockImplementation((callback) => {
       const state = {
         units: { units: [], loading: true, error: null },
         building: { selectedBuildingId: 1, data: [] }
       };
       try {
           return callback(state);
       } catch (e) {
           return undefined;
       }
    });

    render(<UnitBase buildingId={1} />);
    expect(screen.getByText('در حال بارگذاری...')).toBeInTheDocument();
  });

  it('renders units correctly with grouping logic', () => {
    reactRedux.useSelector.mockImplementation((callback) => {
        const state = {
            units: { units: mockUnits, loading: false, error: null },
            building: { selectedBuildingId: 1, data: [] }
        };
        return callback(state);
    });

    render(<UnitBase buildingId={1} />);

    // Owner 1 (Unit 101) should be visible
    expect(screen.getByTestId('unit-item-1')).toBeInTheDocument();

    // Tenant 1 (Unit 102 - No owner) should be visible
    expect(screen.getByTestId('unit-item-2')).toBeInTheDocument();

    // Tenant of Owner 1 (Unit 101) should NOT be visible as a separate item
    expect(screen.queryByTestId('unit-item-3')).not.toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import UnitBase from '../UnitBase';
import * as redux from 'react-redux';
import { fetchUnits } from '../../../slices/unitsSlice';
import { selectSelectedBuilding } from '../../../../building/buildingSlice';

// Mock dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../../slices/unitsSlice', () => ({
  fetchUnits: jest.fn(),
}));

jest.mock('../../../../building/buildingSlice', () => ({
  selectSelectedBuilding: jest.fn(),
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

// Mock moment-jalaali
jest.mock('moment-jalaali', () => {
  const actual = jest.requireActual('moment-jalaali');
  return {
    ...actual,
    loadPersian: jest.fn(),
    default: {
        ...actual,
        loadPersian: jest.fn(),
    }
  };
});

// Mock child components
jest.mock('../UnitItem', () => {
  return function DummyUnitItem({ unit, onSelect }) {
    return (
      <div data-testid="unit-item" onClick={() => onSelect(unit)}>
        {unit.unit_number} - {unit.role}
      </div>
    );
  };
});

jest.mock('../CreateUnitModal', () => () => <div data-testid="create-unit-modal" />);
jest.mock('../UnitDetailsModal', () => () => <div data-testid="unit-details-modal" />);
jest.mock('../../../../../buildings/components/BulkUnitImportModal', () => () => <div data-testid="bulk-import-modal" />);

describe('UnitBase Component', () => {
  const mockDispatch = jest.fn(() => Promise.resolve({ payload: [] }));
  const mockUnits = [
    { id: 1, unit_number: '101', role: 'owner', full_name: 'Owner 1' },
    { id: 2, unit_number: '102', role: 'tenant', full_name: 'Tenant 1' }, // No owner for this unit
    { id: 3, unit_number: '103', role: 'owner', full_name: 'Owner 2' },
    { id: 4, unit_number: '103', role: 'tenant', full_name: 'Tenant 2' }, // Has owner (103)
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    redux.useDispatch.mockReturnValue(mockDispatch);

    // Setup useSelector mock
    redux.useSelector.mockImplementation((selector) => {
        // If we can identify the selector, we return specific data.
        // But selector function references are hard to match.
        // Instead, we can return based on what the selector function likely accesses.
        // Or create a state object and execute the selector.

        const state = {
            units: {
                units: mockUnits,
                loading: false,
                error: null,
            },
            building: {
                selectedBuildingId: 1,
                data: [{ building_id: 1, title: 'Test Building' }],
            },
        };

        // This handles simple property access selectors
        try {
            return selector(state);
        } catch (_e) {
            return null;
        }
    });

    selectSelectedBuilding.mockReturnValue({ building_id: 1, title: 'Test Building' });
    fetchUnits.mockReturnValue({ type: 'units/fetchUnits/pending' });
  });

  test('renders units correctly with grouping logic', () => {
    render(<UnitBase buildingId={1} />);

    // Verify fetchUnits was called
    expect(mockDispatch).toHaveBeenCalled();
    expect(fetchUnits).toHaveBeenCalledWith(1);

    // Verify rendered items
    const items = screen.getAllByTestId('unit-item');

    // Logic check:
    // 101 (owner) -> Should render
    // 102 (tenant) -> Should render (no owner)
    // 103 (owner) -> Should render
    // 103 (tenant) -> Should NOT render (grouped under owner)

    expect(items).toHaveLength(3);

    expect(screen.getByText('101 - owner')).toBeInTheDocument();
    expect(screen.getByText('102 - tenant')).toBeInTheDocument();
    expect(screen.getByText('103 - owner')).toBeInTheDocument();

    // Ensure 103 tenant is not rendered as a separate item
    const unit103Tenant = items.find(item => item.textContent === '103 - tenant');
    expect(unit103Tenant).toBeUndefined();
  });

  test('handles loading state', () => {
    redux.useSelector.mockImplementation((selector) => {
        const state = {
            units: {
                units: [],
                loading: true, // Loading
                error: null,
            },
            building: {
                selectedBuildingId: 1,
                data: [],
            },
        };
        return selector(state);
    });

    render(<UnitBase buildingId={1} />);
    expect(screen.getByText('در حال بارگذاری...')).toBeInTheDocument();
  });
});

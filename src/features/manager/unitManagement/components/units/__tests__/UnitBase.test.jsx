/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import UnitBase from '../UnitBase';
import * as reactRedux from 'react-redux';
import { fetchUnits } from '../../../slices/unitsSlice';

// Mock dependencies
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('../../../slices/unitsSlice', () => ({
  fetchUnits: jest.fn(),
}));

jest.mock('../UnitItem', () => {
  return function MockUnitItem({ unit }) {
    return (
      <div data-testid={`unit-item-${unit.units_id || unit.id}`}>
        {unit.full_name || unit.owner_name || 'Unit'}
      </div>
    );
  };
});

jest.mock('../CreateUnitModal', () => () => <div data-testid="create-unit-modal" />);
jest.mock('../UnitDetailsModal', () => () => <div data-testid="unit-details-modal" />);
jest.mock('../../../../../buildings/components/BulkUnitImportModal', () => () => <div data-testid="bulk-import-modal" />);
jest.mock('../../../../building/buildingSlice', () => ({
  selectSelectedBuilding: jest.fn(),
}));
jest.mock('../../../../../../shared/services/billingService', () => ({
  exportCompleteReports: jest.fn(),
}));

// Mock moment-jalaali
jest.mock('moment-jalaali', () => {
  const m = () => ({
    jYear: () => 1403,
    format: () => '20241027',
  });
  m.loadPersian = jest.fn();
  return m;
});

describe('UnitBase Component', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock dispatch to return a promise (since fetchUnits is a thunk)
    mockDispatch.mockReturnValue(Promise.resolve({ payload: [] }));
    reactRedux.useDispatch.mockReturnValue(mockDispatch);

    // Default fetchUnits mock
    fetchUnits.mockReturnValue({ type: 'units/fetchUnits/pending' });
  });

  const setupState = (unitsState = {}, buildingState = {}) => {
    reactRedux.useSelector.mockImplementation((selector) => {
      // Mock selectSelectedBuilding
      if (selector.name === 'selectSelectedBuilding') {
        return buildingState.selectedBuilding || { id: 1, title: 'Test Building' };
      }

      const state = {
        units: {
          units: [],
          loading: false,
          error: null,
          ...unitsState
        },
        building: {
          selectedBuildingId: 1,
          data: [],
          ...buildingState
        }
      };

      try {
        return selector(state);
      } catch (e) {
        return null;
      }
    });
  };

  it('renders loading state', () => {
    setupState({ loading: true, units: [] });
    render(<UnitBase buildingId={1} />);
    expect(screen.getByText(/در حال بارگذاری/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    setupState({ loading: false, error: 'Error fetching units' });
    render(<UnitBase buildingId={1} />);
    expect(screen.getByText(/خطا در بارگذاری واحدها/i)).toBeInTheDocument();
    expect(screen.getByText('Error fetching units')).toBeInTheDocument();
  });

  it('renders units correctly', () => {
    const mockUnits = [
      { units_id: 101, full_name: 'Owner Unit 101', role: 'owner' },
      { units_id: 102, full_name: 'Tenant Unit 102', role: 'tenant' },
    ];
    setupState({ units: mockUnits });

    render(<UnitBase buildingId={1} />);

    expect(screen.getByTestId('unit-item-101')).toBeInTheDocument();
    expect(screen.getByTestId('unit-item-102')).toBeInTheDocument();
  });

  it('dispatches fetchUnits on mount if buildingId is provided', () => {
    setupState();
    render(<UnitBase buildingId={123} />);
    expect(fetchUnits).toHaveBeenCalledWith(123);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('correctly groups owner and tenant units', () => {
    // This test verifies the grouping logic specifically.
    // The current implementation puts owners first, then unassociated tenants.
    // If a tenant is associated with an owner (not simulated here easily without complex data structure mocking),
    // it's handled inside the UnitItem or logically grouped.
    // The simplified test here just checks that all units appear.

    const mockUnits = [
      { units_id: 1, role: 'owner', unit_number: '1' },
      { units_id: 2, role: 'tenant', unit_number: '1' }, // Tenant for unit 1
      { units_id: 3, role: 'tenant', unit_number: '2' }, // Tenant for unit 2 (no owner)
    ];
    setupState({ units: mockUnits });

    render(<UnitBase buildingId={1} />);

    // Logic:
    // Owner (id:1) added.
    // Tenant (id:2) is associated with unit 1. The code groups them by unit_number.
    // Tenant (id:3) is unassociated owner-wise (owner map doesn't have unit 2).

    expect(screen.getByTestId('unit-item-1')).toBeInTheDocument();
    // Tenant 1 (id:2) might NOT be rendered as a separate item if it's merged into owner unit logic?
    // Let's re-read the code logic.
    // "tenantUnits.forEach... if (!ownerUnits.has(ownerUnitKey)) { result.push(tenantUnit); }"
    // So if tenant has unit_number 1, and owner has unit_number 1, tenant is NOT added to result array.
    // Instead, the owner unit is rendered, and INSIDE UnitItem, it might show the tenant.

    // So unit-item-2 should NOT be in the document as a top-level item if logic holds.
    expect(screen.queryByTestId('unit-item-2')).not.toBeInTheDocument();

    // Tenant 3 (id:3) has unit_number 2. No owner for unit 2. So it should be added.
    expect(screen.getByTestId('unit-item-3')).toBeInTheDocument();
  });
});

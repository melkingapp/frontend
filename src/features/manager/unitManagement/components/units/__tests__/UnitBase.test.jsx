/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UnitBase from '../UnitBase';

// Mock dependencies
jest.mock('moment-jalaali', () => {
  const moment = jest.requireActual('moment-jalaali');
  moment.loadPersian = jest.fn();
  return moment;
});

// Mock components
jest.mock('../UnitItem', () => ({ unit }) => (
  <div data-testid="unit-item">{unit.unit_number || unit.units_id}</div>
));
jest.mock('../CreateUnitModal', () => () => <div data-testid="create-unit-modal" />);
jest.mock('../UnitDetailsModal', () => () => <div data-testid="unit-details-modal" />);
jest.mock('../../../../../buildings/components/BulkUnitImportModal', () => () => <div data-testid="bulk-import-modal" />);

// Mock Redux slices/actions
jest.mock('../../../slices/unitsSlice', () => ({
  fetchUnits: jest.fn(() => {
    const mockPromise = {
      type: 'units/fetchUnits',
      payload: [],
      then: jest.fn((cb) => {
        if (cb) cb({ payload: [] });
        return mockPromise;
      }),
      catch: jest.fn(() => mockPromise),
    };
    return mockPromise;
  }),
}));

jest.mock('../../../../building/buildingSlice', () => ({
  selectSelectedBuilding: jest.fn(),
}));

jest.mock('../../../../../../shared/services/billingService', () => ({
  exportCompleteReports: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  HomeIcon: () => <span />,
  HousePlus: () => <span />,
  Loader2: () => <span />,
  RefreshCw: () => <span />,
  Upload: () => <span />,
  FileText: () => <span />,
  Download: () => <span />,
}));

describe('UnitBase Component', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        units: (state = { units: [], loading: false, error: null }, action) => state,
        building: (state = { selectedBuildingId: 1, data: [] }, action) => state,
      },
      preloadedState: {
        units: {
          units: [
            { units_id: 1, unit_number: '101', role: 'owner', full_name: 'Owner 1' },
            { units_id: 2, unit_number: '102', role: 'tenant', full_name: 'Tenant 1' },
            { units_id: 3, unit_number: '101', role: 'tenant', full_name: 'Tenant 1 of 101' },
          ],
          loading: false,
          error: null,
        },
        building: {
          selectedBuildingId: 1,
          data: [{ building_id: 1, title: 'Building A' }],
        },
      },
    });
  });

  test('renders unit list correctly based on grouping logic', () => {
    render(
      <Provider store={store}>
        <UnitBase buildingId={1} />
      </Provider>
    );

    // Grouping logic:
    // Owner 1 (101) -> Rendered
    // Tenant 1 (102) -> Rendered (no owner found for 102)
    // Tenant 1 of 101 (101) -> Not rendered at top level (owner 101 exists)

    const items = screen.getAllByTestId('unit-item');
    expect(items).toHaveLength(2);
    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();
  });
});

/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UnitBase from '../UnitBase';

// Mocks
jest.mock('moment-jalaali', () => {
  const m = jest.requireActual('moment-jalaali');
  m.loadPersian = jest.fn();
  return m;
});

// Mock child components
jest.mock('../UnitItem', () => {
    return ({ unit }) => <div data-testid="unit-item">{unit.unit_number || unit.units_id}</div>;
});
jest.mock('../CreateUnitModal', () => () => <div data-testid="create-unit-modal" />);
jest.mock('../UnitDetailsModal', () => () => <div data-testid="unit-details-modal" />);
// Correct path relative to this test file to reach features/buildings/components/BulkUnitImportModal
jest.mock('../../../../../buildings/components/BulkUnitImportModal', () => () => <div data-testid="bulk-import-modal" />);

// Mock slices/actions
jest.mock('../../../slices/unitsSlice', () => ({
  fetchUnits: jest.fn(() => ({
    type: 'units/fetchUnits/pending',
    payload: Promise.resolve(),
    then: (cb) => {
      const result = { payload: [] };
      if (cb) cb(result);
      return Promise.resolve(result);
    },
    catch: () => Promise.resolve()
  })),
}));

jest.mock('../../../../../../shared/services/billingService', () => ({
  exportCompleteReports: jest.fn(),
}));

jest.mock('../../../../building/buildingSlice', () => ({
  selectSelectedBuilding: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Setup store
const mockStore = configureStore({
  reducer: {
    units: (state = { units: [], loading: false, error: null }, _action) => state,
    building: (state = { selectedBuildingId: 1, data: [] }, _action) => state,
  },
  preloadedState: {
    units: {
      units: [
        { id: 1, units_id: 1, unit_number: '101', role: 'owner' },
        { id: 2, units_id: 2, unit_number: '102', role: 'tenant' },
        { id: 3, units_id: 3, unit_number: '103', role: 'owner' },
      ],
      loading: false,
      error: null,
    },
    building: {
        selectedBuildingId: 1,
        data: [{ id: 1, title: 'Test Building' }]
    }
  },
});

describe('UnitBase Component', () => {
  test('renders units correctly', async () => {
    render(
      <Provider store={mockStore}>
        <UnitBase buildingId={1} />
      </Provider>
    );

    // Check if UnitItems are rendered
    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();
    expect(screen.getByText('103')).toBeInTheDocument();
  });
});

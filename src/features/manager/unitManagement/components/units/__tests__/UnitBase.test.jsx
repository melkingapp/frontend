/* global jest, describe, test, expect, beforeEach */
import React from 'react';
import { render, screen } from '@testing-library/react';
import UnitBase from '../UnitBase';
import * as redux from 'react-redux';
import { fetchUnits } from '../../../slices/unitsSlice';

// Mock dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../../slices/unitsSlice', () => ({
  fetchUnits: jest.fn(() => ({ type: 'units/fetchUnits/pending' })),
}));

// Mock child components
jest.mock('../UnitItem', () => (props) => (
  <div data-testid="unit-item" onClick={() => props.onSelect(props.unit)}>
    Unit {props.unit.unit_number || props.unit.units_id} - {props.unit.role}
  </div>
));
jest.mock('../CreateUnitModal', () => () => <div data-testid="create-unit-modal" />);
jest.mock('../UnitDetailsModal', () => () => <div data-testid="unit-details-modal" />);
jest.mock('../../../../../buildings/components/BulkUnitImportModal', () => () => <div data-testid="bulk-import-modal" />);

jest.mock('../../../../../../shared/services/billingService', () => ({
  exportCompleteReports: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

// Mock moment-jalaali
jest.mock('moment-jalaali', () => {
  const m = () => ({
    jYear: () => 1403,
    format: () => 'YYYYMMDD'
  });
  m.loadPersian = jest.fn();
  return m;
});

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  HomeIcon: () => <svg data-testid="icon-home" />,
  HousePlus: () => <svg data-testid="icon-house-plus" />,
  Loader2: () => <svg data-testid="icon-loader" />,
  RefreshCw: () => <svg data-testid="icon-refresh" />,
  Upload: () => <svg data-testid="icon-upload" />,
  FileText: () => <svg data-testid="icon-file-text" />,
  Download: () => <svg data-testid="icon-download" />,
}));

describe('UnitBase Component', () => {
  const mockDispatch = jest.fn();
  const mockUnits = [
    { id: 1, unit_number: '101', role: 'owner', units_id: 1 },
    { id: 2, unit_number: '102', role: 'tenant', units_id: 2 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    redux.useDispatch.mockReturnValue(mockDispatch);
    mockDispatch.mockReturnValue(Promise.resolve({ payload: [] }));
  });

  test('renders list of units correctly', () => {
    redux.useSelector.mockImplementation((selector) => {
        const state = {
            units: {
                units: mockUnits,
                loading: false,
                error: null
            },
            building: {
                selectedBuildingId: 10,
                data: [{ building_id: 10, title: 'Test Building' }],
                selectedBuilding: { building_id: 10, title: 'Test Building' }
            }
        };
        return selector(state);
    });

    render(<UnitBase buildingId={10} />);

    expect(mockDispatch).toHaveBeenCalled();
    expect(fetchUnits).toHaveBeenCalledWith(10);
    const items = screen.getAllByTestId('unit-item');
    expect(items).toHaveLength(2);
    expect(screen.getByText(/Unit 101 - owner/)).toBeInTheDocument();
  });
});

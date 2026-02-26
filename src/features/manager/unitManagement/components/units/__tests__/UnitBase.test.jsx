/* global jest, describe, it, expect, beforeEach */
import React from 'react';
import { render, screen } from '@testing-library/react';
import UnitBase from '../UnitBase';
import { useDispatch, useSelector } from 'react-redux';
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

jest.mock('lucide-react', () => ({
  HomeIcon: () => <div data-testid="HomeIcon" />,
  HousePlus: () => <div data-testid="HousePlus" />,
  Loader2: () => <div data-testid="Loader2" />,
  RefreshCw: () => <div data-testid="RefreshCw" />,
  Upload: () => <div data-testid="Upload" />,
  FileText: () => <div data-testid="FileText" />,
  Download: () => <div data-testid="Download" />,
}));

jest.mock('../UnitItem', () => ({ unit }) => <div data-testid="UnitItem">{unit.unit_number || unit.units_id}</div>);
jest.mock('../CreateUnitModal', () => () => <div data-testid="CreateUnitModal" />);
jest.mock('../UnitDetailsModal', () => () => <div data-testid="UnitDetailsModal" />);
jest.mock('../../../../../buildings/components/BulkUnitImportModal', () => () => <div data-testid="BulkUnitImportModal" />);

jest.mock('../../../../../../shared/services/billingService', () => ({
  exportCompleteReports: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('moment-jalaali', () => {
    const moment = () => ({
        jYear: () => 1403,
        format: () => '20240101',
    });
    moment.loadPersian = jest.fn();
    return moment;
});

describe('UnitBase', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    mockDispatch.mockReturnValue(Promise.resolve({ payload: [] }));
    selectSelectedBuilding.mockReturnValue({ id: 1, title: 'Test Building' });
  });

  it('renders loading state when loading is true and no units', () => {
    useSelector.mockImplementation((selector) => {
        const state = {
            units: { units: [], loading: true, error: null },
            building: { selectedBuildingId: 1, data: [] },
        };
        if (selector === selectSelectedBuilding) return { id: 1, title: 'Test Building' };
        return selector(state);
    });

    render(<UnitBase />);
    expect(screen.getByTestId('Loader2')).toBeInTheDocument();
  });

  it('renders error state', () => {
    useSelector.mockImplementation((selector) => {
        const state = {
            units: { units: [], loading: false, error: 'Failed to fetch' },
            building: { selectedBuildingId: 1, data: [] },
        };
        if (selector === selectSelectedBuilding) return { id: 1, title: 'Test Building' };
        return selector(state);
    });

    render(<UnitBase />);
    expect(screen.getByText('خطا در بارگذاری واحدها')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    useSelector.mockImplementation((selector) => {
        const state = {
            units: { units: [], loading: false, error: null },
            building: { selectedBuildingId: 1, data: [] },
        };
        if (selector === selectSelectedBuilding) return { id: 1, title: 'Test Building' };
        return selector(state);
    });

    render(<UnitBase />);
    expect(screen.getByText('واحدی موجود نیست.')).toBeInTheDocument();
  });

  it('renders units correctly grouping owners and tenants', () => {
    const units = [
      { id: 1, units_id: 1, unit_number: '101', role: 'owner', full_name: 'Owner 1' },
      { id: 2, units_id: 2, unit_number: '102', role: 'tenant', full_name: 'Tenant 1' },
      { id: 3, units_id: 3, unit_number: '101', role: 'tenant', full_name: 'Tenant 2' },
    ];

    useSelector.mockImplementation((selector) => {
        const state = {
            units: { units: units, loading: false, error: null },
            building: { selectedBuildingId: 1, data: [] },
        };
        if (selector === selectSelectedBuilding) return { id: 1, title: 'Test Building' };
        return selector(state);
    });

    render(<UnitBase />);

    const items = screen.getAllByTestId('UnitItem');
    expect(items).toHaveLength(2);
    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();
  });
});

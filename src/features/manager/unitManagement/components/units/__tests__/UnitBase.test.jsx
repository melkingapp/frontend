/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import UnitBase from '../UnitBase';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedBuilding } from '../../../../building/buildingSlice';

// Mock Redux
jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
}));

// Mock imported dependencies
jest.mock('moment-jalaali', () => {
    const moment = jest.requireActual('moment-jalaali');
    return {
        ...moment,
        loadPersian: jest.fn(),
    };
});

jest.mock('../UnitItem', () => {
    return function MockUnitItem({ unit }) {
        return <div data-testid="unit-item">{unit.unit_number || unit.units_id}</div>;
    };
});

jest.mock('../CreateUnitModal', () => () => <div data-testid="create-unit-modal" />);
jest.mock('../UnitDetailsModal', () => () => <div data-testid="unit-details-modal" />);
jest.mock('../../../../../buildings/components/BulkUnitImportModal', () => () => <div data-testid="bulk-import-modal" />);

jest.mock('../../../slices/unitsSlice', () => ({
    fetchUnits: jest.fn(() => ({ type: 'units/fetchUnits', payload: Promise.resolve([]) })),
}));

jest.mock('../../../../building/buildingSlice', () => ({
    selectSelectedBuilding: jest.fn(),
}));

jest.mock('../../../../../../shared/services/billingService', () => ({
    exportCompleteReports: jest.fn(),
}));

describe('UnitBase Component', () => {
    const mockDispatch = jest.fn();

    beforeEach(() => {
        useDispatch.mockReturnValue(mockDispatch);
        mockDispatch.mockImplementation((_action) => {
             return {
                 payload: [],
                 type: 'mock',
                 then: (cb) => {
                    if (cb) cb({ payload: [] });
                    return Promise.resolve({ payload: [] });
                 },
                 catch: () => Promise.resolve()
             };
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders units correctly', () => {
        const mockUnits = [
            { units_id: 1, unit_number: '101', role: 'owner' },
            { units_id: 2, unit_number: '102', role: 'tenant' },
            { units_id: 3, unit_number: '103', role: 'owner' },
        ];

        useSelector.mockImplementation((selector) => {
            if (selector === selectSelectedBuilding) {
                return { id: 1, title: 'Test Building' };
            }

            // Mock state structure expected by selectors
            const state = {
                units: {
                    units: mockUnits,
                    loading: false,
                    error: null,
                },
                building: {
                    selectedBuildingId: 1,
                    data: [{ id: 1, building_id: 1, title: 'Test Building' }],
                },
            };

            if (typeof selector === 'function') {
                return selector(state);
            }
            return state;
        });

        render(<UnitBase buildingId={1} />);

        expect(screen.getByText('101')).toBeInTheDocument();
        expect(screen.getByText('102')).toBeInTheDocument();
        expect(screen.getByText('103')).toBeInTheDocument();
        expect(screen.getAllByTestId('unit-item')).toHaveLength(3);
    });
});

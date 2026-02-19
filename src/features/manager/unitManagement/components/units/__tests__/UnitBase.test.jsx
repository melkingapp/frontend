/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UnitBase from '../UnitBase';
import unitsReducer from '../../../slices/unitsSlice';
import buildingReducer from '../../../../building/buildingSlice';

// Mock moment-jalaali
jest.mock('moment-jalaali', () => {
    const moment = () => ({
        format: jest.fn(() => '20240101'),
        jYear: jest.fn(() => 1403),
    });
    moment.loadPersian = jest.fn();
    return moment;
});

// Mock dependencies
jest.mock('../UnitItem', () => {
    return function MockUnitItem({ unit, onSelect }) {
        return (
            <div data-testid="unit-item" onClick={() => onSelect(unit)}>
                <span data-testid="unit-role">{unit.role}</span>
                <span data-testid="unit-number">{unit.unit_number || unit.units_id}</span>
                <span data-testid="unit-owner">{unit.owner_name}</span>
            </div>
        );
    };
});

jest.mock('../CreateUnitModal', () => () => <div data-testid="create-unit-modal" />);
jest.mock('../UnitDetailsModal', () => () => <div data-testid="unit-details-modal" />);
jest.mock('../../../../../buildings/components/BulkUnitImportModal', () => () => <div data-testid="bulk-import-modal" />);

jest.mock('../../../../../../shared/services/billingService', () => ({
    exportCompleteReports: jest.fn(),
}));

jest.mock('../../../../../../shared/services/unitsApi', () => ({
    getBuildingUnits: jest.fn(),
    getUnitDetail: jest.fn(),
    createUnit: jest.fn(),
    updateUnit: jest.fn(),
    deleteUnit: jest.fn(),
    createManagerUnit: jest.fn(),
}));

jest.mock('../../../../../../shared/utils/apiConfig', () => ({
    getApiBaseUrl: jest.fn(() => 'http://localhost:8000/api/v1'),
    getMediaBaseUrl: jest.fn(() => 'http://localhost:8000'),
}));

// Mock fetchUnits async thunk
jest.mock('../../../slices/unitsSlice', () => {
    const actual = jest.requireActual('../../../slices/unitsSlice');
    return {
        __esModule: true,
        ...actual,
        default: actual.default,
        fetchUnits: jest.fn(() => ({ type: 'units/fetchUnits/pending', then: (cb) => { cb({ payload: [] }); return { catch: () => {} }; } })),
    };
});

// Helper to create store
const createMockStore = (initialState) => {
    return configureStore({
        reducer: {
            units: unitsReducer,
            building: buildingReducer,
        },
        preloadedState: initialState,
    });
};

describe('UnitBase', () => {
    let store;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders units correctly grouped', () => {
        const mockUnits = [
            { units_id: 1, unit_number: '101', role: 'owner', owner_name: 'Owner 1' },
            { units_id: 2, unit_number: '101', role: 'tenant', owner_name: 'Owner 1', resident_name: 'Tenant 1' }, // Tenant linked to owner 1
            { units_id: 3, unit_number: '102', role: 'owner', owner_name: 'Owner 2' },
            { units_id: 4, unit_number: '103', role: 'tenant', owner_name: 'Unknown', resident_name: 'Tenant 2' }, // Tenant without linked owner in list
        ];

        store = createMockStore({
            units: {
                units: mockUnits,
                loading: false,
                error: null,
            },
            building: {
                selectedBuildingId: 1,
                data: [{ building_id: 1, title: 'Test Building' }],
            },
        });

        render(
            <Provider store={store}>
                <UnitBase buildingId={1} />
            </Provider>
        );

        const unitItems = screen.getAllByTestId('unit-item');

        // Expected: Owner 1 (101), Owner 2 (102), Tenant 2 (103)
        // Tenant 1 (101) is filtered out because Owner 1 exists
        expect(unitItems).toHaveLength(3);

        const ownerNames = unitItems.map(item => item.querySelector('[data-testid="unit-owner"]').textContent);
        expect(ownerNames).toContain('Owner 1');
        expect(ownerNames).toContain('Owner 2');
        expect(ownerNames).toContain('Unknown'); // Tenant 2's owner name
    });
});

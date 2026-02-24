import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UnitBase from '../UnitBase';

// Mock moment-jalaali to prevent side-effect issues
jest.mock('moment-jalaali', () => {
    const moment = jest.requireActual('moment');
    moment.loadPersian = jest.fn();
    return moment;
});

// Mock child components to simplify testing
jest.mock('../UnitItem', () => () => <div data-testid="unit-item">Unit Item</div>);
jest.mock('../CreateUnitModal', () => () => <div data-testid="create-unit-modal">Create Unit Modal</div>);
jest.mock('../UnitDetailsModal', () => () => <div data-testid="unit-details-modal">Unit Details Modal</div>);
jest.mock('../../../../../buildings/components/BulkUnitImportModal', () => () => <div data-testid="bulk-import-modal">Bulk Import Modal</div>);

// Mock redux actions
jest.mock('../../../slices/unitsSlice', () => ({
    fetchUnits: jest.fn(() => (dispatch) => {
        return Promise.resolve({ payload: [] });
    }),
}));

jest.mock('../../../../building/buildingSlice', () => ({
    selectSelectedBuilding: jest.fn(() => ({ id: 1, title: 'Test Building' })),
}));

// Mock service
jest.mock('../../../../../../shared/services/billingService', () => ({
    exportCompleteReports: jest.fn(),
}));


describe('UnitBase Component', () => {
    const initialState = {
        units: {
            units: [
                { id: 1, unit_number: '101', role: 'owner', full_name: 'Owner 1' },
                { id: 2, unit_number: '102', role: 'tenant', full_name: 'Tenant 1' }
            ],
            loading: false,
            error: null
        },
        building: {
            selectedBuildingId: 1,
            data: [{ id: 1, title: 'Test Building' }]
        }
    };

    const mockStore = configureStore({
        reducer: {
            units: (state = initialState.units, action) => state,
            building: (state = initialState.building, action) => state,
        }
    });

    it('renders without crashing', () => {
        render(
            <Provider store={mockStore}>
                <UnitBase buildingId={1} />
            </Provider>
        );

        expect(screen.getByText('مدیریت واحدها')).toBeInTheDocument();
        // Since we have units, we expect UnitItems to be rendered
        expect(screen.getAllByTestId('unit-item')).toHaveLength(2);
    });

    it('displays loading state', () => {
        const loadingStore = configureStore({
            reducer: {
                units: (state = { ...initialState.units, loading: true, units: [] }, action) => state,
                building: (state = initialState.building, action) => state,
            }
        });

        render(
            <Provider store={loadingStore}>
                <UnitBase buildingId={1} />
            </Provider>
        );

        expect(screen.getByText('در حال بارگذاری...')).toBeInTheDocument();
    });

    it('displays empty state', () => {
        const emptyStore = configureStore({
            reducer: {
                units: (state = { ...initialState.units, units: [] }, action) => state,
                building: (state = initialState.building, action) => state,
            }
        });

        render(
            <Provider store={emptyStore}>
                <UnitBase buildingId={1} />
            </Provider>
        );

        expect(screen.getByText('واحدی موجود نیست.')).toBeInTheDocument();
    });
});

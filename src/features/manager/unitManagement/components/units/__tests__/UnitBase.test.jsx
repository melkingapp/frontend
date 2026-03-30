
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UnitBase from '../UnitBase';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
// import { jest } from '@jest/globals'; // remove this as jest is global

// Mock dependencies
jest.mock('moment-jalaali', () => {
    const momentMock = () => ({
        jYear: () => 1403,
        format: () => '1403/01/01',
    });
    momentMock.loadPersian = jest.fn();
    return {
        __esModule: true,
        default: momentMock
    };
});

// Mock UnitItem to avoid complex rendering and ensure it receives props
jest.mock('../UnitItem', () => {
    return function MockUnitItem({ unit }) {
        return <div data-testid="unit-item">{unit.unit_number || unit.units_id}</div>;
    };
});

// Mock slice actions
const mockFetchUnits = jest.fn();
jest.mock('../../../slices/unitsSlice', () => ({
    fetchUnits: (...args) => {
        mockFetchUnits(...args);
        return { type: 'units/fetchUnits/pending', then: (cb) => { cb({ payload: [] }); return { catch: jest.fn() } } };
    },
    clearError: jest.fn(() => ({ type: 'units/clearError' })),
}));

describe('UnitBase Performance', () => {
    let store;

    const initialState = {
        units: {
            units: [
                { id: 1, unit_number: '101', role: 'owner', owner_name: 'Owner 1' },
                { id: 2, unit_number: '102', role: 'tenant', owner: { full_name: 'Owner 2' }, unit_number: '102' },
                { id: 3, unit_number: '103', role: 'owner', owner_name: 'Owner 3' },
            ],
            loading: false,
            error: null
        },
        building: {
            selectedBuildingId: 'build-1',
            data: [{ building_id: 'build-1', title: 'Test Building' }]
        }
    };

    beforeEach(() => {
        store = configureStore({
            reducer: {
                units: (state = initialState.units, action) => state,
                building: (state = initialState.building, action) => state,
            }
        });
        mockFetchUnits.mockClear();
    });

    test('renders units correctly', () => {
        render(
            <Provider store={store}>
                <UnitBase buildingId="build-1" />
            </Provider>
        );

        // Check if units are rendered
        const items = screen.getAllByTestId('unit-item');
        expect(items).toHaveLength(3);
        expect(screen.getByText('101')).toBeInTheDocument();
        expect(screen.getByText('102')).toBeInTheDocument();
        expect(screen.getByText('103')).toBeInTheDocument();
    });
});

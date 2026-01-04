
import { sanitizeBuildingData, sanitizeRequestData } from './security';

describe('Security Utilities', () => {
    describe('sanitizeBuildingData', () => {
        test('should sanitize building data correctly', () => {
            const sensitiveBuilding = {
                id: 1,
                building_id: 101,
                title: "Safe Building",
                secret_key: "HIDDEN_KEY",
                internal_flag: true,
                manager_password_hash: "hashed_value",
                address: "123 Safe St",
                role: "resident"
            };

            const sanitized = sanitizeBuildingData(sensitiveBuilding);

            expect(sanitized).toHaveProperty('id');
            expect(sanitized).toHaveProperty('building_id');
            expect(sanitized).toHaveProperty('title');
            expect(sanitized).toHaveProperty('address');
            expect(sanitized).toHaveProperty('role');

            expect(sanitized).not.toHaveProperty('secret_key');
            expect(sanitized).not.toHaveProperty('internal_flag');
            expect(sanitized).not.toHaveProperty('manager_password_hash');
        });

        test('should return null for null input', () => {
            expect(sanitizeBuildingData(null)).toBeNull();
        });
    });

    describe('sanitizeRequestData', () => {
        test('should sanitize request data correctly', () => {
            const sensitiveRequest = {
                id: 500,
                request_type: "repair",
                status: "pending",
                admin_notes: "User is annoying",
                internal_id: "INT-999",
                description: "Fix the door"
            };

            const sanitized = sanitizeRequestData(sensitiveRequest);

            expect(sanitized).toHaveProperty('id');
            expect(sanitized).toHaveProperty('request_type');
            expect(sanitized).toHaveProperty('status');
            expect(sanitized).toHaveProperty('description');

            expect(sanitized).not.toHaveProperty('admin_notes');
            expect(sanitized).not.toHaveProperty('internal_id');
        });

        test('should sanitize nested building in request', () => {
            const sensitiveRequest = {
                id: 500,
                building: {
                    id: 1,
                    title: "Building 1",
                    secret: "hidden"
                }
            };

            const sanitized = sanitizeRequestData(sensitiveRequest);

            expect(sanitized.building).toHaveProperty('id');
            expect(sanitized.building).toHaveProperty('title');
            expect(sanitized.building).not.toHaveProperty('secret');
        });

        test('should return null for null input', () => {
            expect(sanitizeRequestData(null)).toBeNull();
        });
    });
});

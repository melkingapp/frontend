/* global describe, it, expect */
import { getPersianType, getPersianStatus, getPersianDistributionMethod } from '../typeUtils';

describe('typeUtils', () => {
  describe('getPersianType', () => {
    it('should return correct Persian type for known English types', () => {
      expect(getPersianType('water_bill')).toBe('قبض آب');
      expect(getPersianType('electricity_bill')).toBe('قبض برق');
      expect(getPersianType('gas_bill')).toBe('قبض گاز');
      expect(getPersianType('maintenance')).toBe('تعمیرات');
      expect(getPersianType('cleaning')).toBe('نظافت');
      expect(getPersianType('security')).toBe('امنیت');
      expect(getPersianType('camera')).toBe('دوربین');
      expect(getPersianType('parking')).toBe('پارکینگ');
      expect(getPersianType('charge')).toBe('شارژ');
      expect(getPersianType('purchases')).toBe('اقلام خریدنی');
    });

    it('should handle capitalized inputs', () => {
      expect(getPersianType('Water')).toBe('قبض آب');
      expect(getPersianType('Electricity')).toBe('قبض برق');
      expect(getPersianType('Maintenance')).toBe('تعمیرات');
    });

    it('should handle charge_type in item object', () => {
      expect(getPersianType('some_type', { charge_type: 'current' })).toBe('شارژ جاری');
      expect(getPersianType('some_type', { charge_type: 'construction' })).toBe('شارژ عمرانی');
      expect(getPersianType('some_type', { charge_type: 'parking' })).toBe('شارژ پارکینگ');
      expect(getPersianType('some_type', { charge_type: 'elevator' })).toBe('شارژ آسانسور');
      expect(getPersianType('some_type', { charge_type: 'other' })).toBe('شارژ سایر');
    });

    it('should default to "شارژ" for unknown charge_type in item', () => {
        expect(getPersianType('some_type', { charge_type: 'unknown_charge_type' })).toBe('شارژ');
    });

    it('should return the input string if no mapping exists', () => {
      expect(getPersianType('unknown_type')).toBe('unknown_type');
    });

    it('should return null/undefined as is (or handle gracefully if string expected)', () => {
        expect(getPersianType(null)).toBe(null);
        expect(getPersianType(undefined)).toBe(undefined);
    });
  });

  describe('getPersianStatus', () => {
    it('should return correct Persian status for known English statuses', () => {
      expect(getPersianStatus('paid')).toBe('پرداخت شده');
      expect(getPersianStatus('pending')).toBe('منتظر پرداخت');
      expect(getPersianStatus('cancelled')).toBe('لغو شده');
      expect(getPersianStatus('overdue')).toBe('سررسید گذشته');
      expect(getPersianStatus('approved')).toBe('تایید شده');
      expect(getPersianStatus('rejected')).toBe('تایید نشده');
      expect(getPersianStatus('awaiting_manager')).toBe('منتظر تایید مدیر');
      expect(getPersianStatus('excellent')).toBe('ممتاز');
    });

    it('should handle capitalized inputs', () => {
      expect(getPersianStatus('Paid')).toBe('پرداخت شده');
      expect(getPersianStatus('Pending')).toBe('منتظر پرداخت');
      expect(getPersianStatus('Approved')).toBe('تایید شده');
    });

    it('should return input string if no mapping exists', () => {
      expect(getPersianStatus('unknown_status')).toBe('unknown_status');
    });

    it('should return null/undefined as is', () => {
        expect(getPersianStatus(null)).toBe(null);
        expect(getPersianStatus(undefined)).toBe(undefined);
    });
  });

  describe('getPersianDistributionMethod', () => {
      it('should return correct Persian distribution method', () => {
          expect(getPersianDistributionMethod('equal')).toBe('تقسیم مساوی');
          expect(getPersianDistributionMethod('per_person')).toBe('بر اساس تعداد نفر');
          expect(getPersianDistributionMethod('area')).toBe('بر اساس متراژ');
          expect(getPersianDistributionMethod('parking')).toBe('پارکینگ');
          expect(getPersianDistributionMethod('usage_based')).toBe('بر اساس مصرف');
      });

      it('should handle legacy values', () => {
          expect(getPersianDistributionMethod('area_based')).toBe('بر اساس متراژ');
          expect(getPersianDistributionMethod('person_based')).toBe('بر اساس تعداد نفر');
      });

      it('should return input if no mapping exists but truthy', () => {
          expect(getPersianDistributionMethod('some_custom_method')).toBe('some_custom_method');
      });

      it('should default to "نامشخص" if method is falsy/unknown and not in map', () => {
          expect(getPersianDistributionMethod(null)).toBe('نامشخص');
          expect(getPersianDistributionMethod(undefined)).toBe('نامشخص');
          expect(getPersianDistributionMethod('')).toBe('نامشخص');
      });
  });
});

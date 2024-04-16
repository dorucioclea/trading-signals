import {FasterMOM, MOM} from './MOM.js';
import {NotEnoughDataError} from '../error/index.js';

describe('MOM', () => {
  describe('update', () => {
    it('can replace recently added values', () => {
      const momentum = new MOM(5);
      const fasterMomentum = new FasterMOM(5);

      momentum.update('81.59');
      fasterMomentum.update(81.59);
      momentum.update('81.06');
      fasterMomentum.update(81.06);
      momentum.update('82.87');
      fasterMomentum.update(82.87);
      momentum.update('83.0');
      fasterMomentum.update(83.0);
      momentum.update('83.61');
      fasterMomentum.update(83.61);
      momentum.update('90');
      fasterMomentum.update(90);
      momentum.update('83.15', true);
      fasterMomentum.update(83.15, true);

      expect(momentum.isStable).toBe(true);
      expect(fasterMomentum.isStable).toBe(true);

      expect(momentum.getResult().toFixed(2)).toBe('1.56');
      expect(fasterMomentum.getResult().toFixed(2)).toBe('1.56');
    });
  });

  describe('getResult', () => {
    it('returns the price 5 intervals ago', () => {
      // Test data verified with:
      // https://github.com/TulipCharts/tulipindicators/blob/v0.8.0/tests/untest.txt#L286-L288
      const inputs = [
        81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53, 86.54, 86.89, 87.77, 87.29,
      ];
      const outputs = [1.56, 1.78, 1.12, 1.55, 0.75, 2.38, 3.7, 2.9, 3.22, 2.93];
      const momentum = new MOM(5);
      const fasterMomentum = new FasterMOM(5);

      for (const input of inputs) {
        momentum.update(input);
        fasterMomentum.update(input);
        if (momentum.isStable && fasterMomentum.isStable) {
          const actual = momentum.getResult().toFixed(3);
          const expected = outputs.shift()!;
          expect(parseFloat(actual)).toBe(expected);
          expect(fasterMomentum.getResult().toFixed(2)).toBe(expected.toFixed(2));
        }
      }

      expect(momentum.isStable).toBe(true);
      expect(fasterMomentum.isStable).toBe(true);

      expect(momentum.lowest?.toFixed(2)).toBe('0.75');
      expect(fasterMomentum.lowest?.toFixed(2)).toBe('0.75');

      expect(momentum.highest?.toFixed(2)).toBe('3.70');
      expect(fasterMomentum.highest?.toFixed(2)).toBe('3.70');
    });

    it('throws an error when there is not enough input data', () => {
      const momentum = new MOM(5);

      try {
        momentum.getResult();
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(NotEnoughDataError);
      }
    });
  });
});

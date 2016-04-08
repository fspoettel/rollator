
/* ! rollator unit tests v0.2.1
 */

/* eslint-disable no-unused-expressions */

import chai from 'chai';
import { describe, before, it } from 'mocha';
import Rollator from '../src/rollator';

const expect = chai.expect;

describe('rollator module', () => {
  const str = 'iamamiwhoami - kin';
  let rollator;

  before(() => {
    rollator = new Rollator();
  });

  // rollator._match

  describe('match', () => {
    it('should match single characters', () => {
      const match = rollator._match;
      expect(match(str, 'e')).to.be.false;
      expect(match(str, 'w')).to.eql({ start: 6, end: 7 });
    });

    it('should match multiple characters', () => {
      const match = rollator._match;
      expect(match(str, 'iame'))
        .to.be.false;

      expect(match(str, 'ami'))
        .to.eql({ start: 3, end: 6 });

      expect(match(str, 'ami -'))
        .to.eql({ start: 9, end: 14 });
    });

    it('should handle case-sensitive mode', () => {
      const match = rollator._match;
      expect(match(str, 'Iam', true))
        .to.be.false;

      expect(match(str.toUpperCase(), 'IAM'))
        .to.eql({ start: 0, end: 3 });
    });
  });

  // rollator._slice

  describe('slice', () => {
    it('should handle valid position', () => {
      const slice = rollator._slice;

      expect(slice(str, { start: 0, end: 3 }))
        .to.eql({ index: 0, strings: ['iam', 'amiwhoami - kin'] });

      expect(slice(str, { start: 3, end: 6 }))
        .to.eql({ index: 1, strings: ['iam', 'ami', 'whoami - kin'] });

      expect(slice(str, { start: str.length - 3, end: str.length }))
        .to.eql({ index: 1, strings: ['iamamiwhoami - ', 'kin'] });
    });

    it('should handle no position', () => {
      const slice = rollator._slice;

      expect(slice(str, false))
        .to.eql({ index: false, strings: [str] });
    });
  });

  // rollator._wrap
  describe('wrap', () => {
    it('should wrap matching strings', () => {
      const wrap = rollator._wrap;
      const strObj = { index: 1, strings: ['iam', 'ami', 'whoami - kin'] };

      expect(wrap(strObj))
        .to.eql([
          '<span>iam</span>',
          '<span data-rltr="match">ami</span>',
          '<span>whoami&nbsp;-&nbsp;kin</span>'
        ]);
    });
    it('should wrap non-matching strings', () => {
      const wrap = rollator._wrap;
      const strObj = { index: false, strings: ['iamamiwhoami - kin'] };

      expect(wrap(strObj))
        .to.eql([
          '<span data-rltr="nomatch">iamamiwhoami&nbsp;-&nbsp;kin</span>',
        ]);
    });
  });

  // rollator._calculateOffsetX

  describe('calculateOffsetX', () => {
    it('should handle default mode', () => {
      const calc = rollator._calculateOffsetX;

      expect(calc(100, 120, 200, 301, 0))
        .to.equal(20);
    });

    it('should handle nulled mode', () => {
      const calc = rollator._calculateOffsetX;

      expect(calc(180, 360, 200, 381, 0))
        .to.equal(0);
    });

    it('should handle vertical mode', () => {
      const calc = rollator._calculateOffsetX;

      expect(calc(100, 120, 200, 300, 0))
        .to.equal(null);
    });
    it('should handle disabling', () => {
      const calc = rollator._calculateOffsetX;

      expect(calc(100, 120, 200, 301, 400))
        .to.equal(null);
    });
  });
});

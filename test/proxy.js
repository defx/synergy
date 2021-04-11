import { wrapProxy } from '../src/proxy.js';

describe('proxy', () => {
  describe('callbackAny', () => {
    it('should callback when new value is added', async () => {
      let count = 0;
      let value = wrapProxy({}, () => count++, []);
      value.bar = 'foo';
      await nextFrame();
      assert.equal(count, 1);
    });
    it('should callback when existing value is changed', async () => {
      let count = 0;
      let value = wrapProxy({ foo: 'bar' }, () => count++, []);
      value.foo = 123;
      await nextFrame();
      assert.equal(count, 1);
    });
    it('should not callback when existing value is set to the same value', async () => {
      let count = 0;
      let value = wrapProxy({ foo: 'bar' }, () => count++);
      value.foo = 'bar';
      await nextFrame();
      assert.equal(count, 0);
    });
    it('should callback when property is deleted', async () => {
      let count = 0;
      let value = wrapProxy({ foo: 'bar' }, () => count++);
      delete value.foo;
      await nextFrame();
      assert.equal(count, 1);
    });
  });
});

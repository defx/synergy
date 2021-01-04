import proxy from '../src/proxy.js';

/*

proxy(
  root = {},
  callbackAny,
  callbackObserved = NOOP,
  observedProperties = []
)

*/

describe('proxy', () => {
  describe('callbackAny', () => {
    it('should callback when new value is added', async () => {
      let count = 0;
      let value = proxy({}, () => count++, []);
      value.bar = 'foo';
      await nextFrame();
      assert.equal(count, 1);
    });
    it('should callback when existing value is changed', async () => {
      let count = 0;
      let value = proxy({ foo: 'bar' }, () => count++, []);
      value.foo = 123;
      await nextFrame();
      assert.equal(count, 1);
    });
    it('should not callback when existing value is set to the same value', async () => {
      let count = 0;
      let value = proxy({ foo: 'bar' }, () => count++);
      value.foo = 'bar';
      await nextFrame();
      assert.equal(count, 0);
    });
    it('should callback when property is deleted', async () => {
      let count = 0;
      let value = proxy({ foo: 'bar' }, () => count++);
      delete value.foo;
      await nextFrame();
      assert.equal(count, 1);
    });
  });
  describe('callbackObserved', () => {
    it('should callback with name and value', async () => {
      let stack = [];
      let model = proxy(
        { foo: 'bar' },
        () => {},
        ['foo'],
        (...args) => stack.push(args)
      );
      model.bar = 7;
      await nextFrame();
      assert.equal(stack.length, 0);
      model.foo = 'baa';
      await nextFrame();
      assert.deepEqual(stack, [['foo', 'baa']]);
    });
  });
});

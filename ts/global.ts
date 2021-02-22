export {};

declare global {
  interface Node {
    bindingId: number;
    __bindings__: BindingType[];
    __index__: number;
    [key: string]: any;
  }
  interface EventTarget {
    bindingId: number;
    __bindings__: BindingType[];
    __index__: number;
    [key: string]: any;
  }
}

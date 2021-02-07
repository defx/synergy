declare global {
  interface Node {
    bindingId: number;
    __bindings__: Binding[];
  }
}

/*

@todo:

- type needs to be an enum
- extend core interface for each type

*/

export enum BindingType {
  ATTRIBUTE,
  INPUT,
  LIST,
  LIST_ITEM,
  TEXT,
  CALL,
  SET,
}

export interface Binding {
  type: BindingType;
  uid?: string;
  path?: string;
  nodes?: Node[];
  parts?: { type: string; value: string }[];
  listItems?: [];
  childIndex?: number;
  context?: RepeatedBlock[];
  eventName?: string;
  method?: string;
  name?: string;
}

export interface RepeatedBlock {
  /**
   * Custom identifier for current array item in template
   */
  valueIdentifier: string;
  /**
   * The property name that identifies the array in the view model
   */
  prop: string;
  /**
   * Optionally provide a custom key for list item identity. Defaults to "id"
   */
  key: string;
}

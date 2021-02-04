declare global {
  interface Element {
    bindingId: number;
    __bindings__: Binding[];
  }
}

export interface Binding {
  type: string;
  uid?: string;
  path?: string;
  nodes?: Element[];
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

interface RepeatedBlock {
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

enum Binding {
  TEXT,
  ATTRIBUTE,
  INPUT,
  SET,
  LIST,
  LIST_ITEM,
  CALL,
}

type Part = {
  type: string;
  value: string;
};

type ListBinding = {
  type: Binding.LIST;
  uid: string;
  listItems: Node[][];
  nodes: Node[];
  path: string;
  context?: RepeatedBlock[];
  data?: any[];
};

type ListItemBinding = {
  type: Binding.LIST_ITEM;
  uid: string;
  path: string;
  context?: RepeatedBlock[];
};

type AttributeBinding = {
  type: Binding.ATTRIBUTE;
  name: string;
  data?: any;
  context: RepeatedBlock[];
  parts: Part[];
};

type TextBinding = {
  type: Binding.TEXT;
  context: RepeatedBlock[];
  parts: Part[];
  childIndex: number;
};

type InputBinding = {
  type: Binding.INPUT;
  path: string;
  parts: Part[];
  data?: any;
  context?: RepeatedBlock[];
};

// the following two are only used within event handlers...
// would probably make more sense to separate them from the other (data) bindings.
// they could be keyed by eventName to avoid the filtering (subscribe.js)

/*

yeah, coming back to this again, its a little akward.

*/

type SetBinding = {
  type: Binding.SET;
  eventName: string;
  path: string;
  realPath?: string;
  context?: RepeatedBlock[];
};

type CallBinding = {
  type: Binding.CALL;
  eventName: string;
  method: string;
  path?: string;
};

type BindingType =
  | ListBinding
  | ListItemBinding
  | InputBinding
  | AttributeBinding
  | TextBinding
  | SetBinding
  | CallBinding;

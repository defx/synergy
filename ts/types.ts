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
  context: RepeatedBlock[];
  parts: Part[];
  data: any[];
};

type ListItemBinding = {
  type: Binding.LIST_ITEM;
  parts: Part[];
  uid: string;
  path: string;
  context: RepeatedBlock[];
};

type AttributeBinding = {
  type: Binding.ATTRIBUTE;
  name: string;
  data: any;
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
  data: any;
  context: RepeatedBlock[];
};

type SetBinding = {
  type: Binding.SET;
  eventName: string;
  method: string;
  path: string;
  realPath: string;
  context: RepeatedBlock[];
};

type BindingType =
  | ListBinding
  | ListItemBinding
  | InputBinding
  | AttributeBinding
  | TextBinding
  | SetBinding;

export const navigation = [
  {
    title: "Learn by Example",
    items: [
      {
        title: "my-counter",
        href: "/my-counter",
      },
      {
        title: "simple-clock",
        href: "/simple-clock",
      },
      {
        title: "todo-list",
        href: "/todo-list",
      },
    ],
  },
  {
    title: "Reference",
    items: [
      {
        title: "Template syntax",
        href: "/template-syntax",
      },
      {
        title: "Repeated blocks",
        href: "/repeated-blocks",
      },
      {
        title: "Events",
        href: "/events",
      },
      {
        title: "Styles",
        href: "/styles",
      },
      {
        title: "Forms",
        href: "/forms",
      },
    ],
  },
]

function flatten(items) {
  return items.reduce((acc, item) => {
    if (item.items) {
      acc.push(...item.items.map((v) => ({ ...v, category: item.title })))
    }
    return acc
  }, [])
}

export const flatNav = flatten(navigation)

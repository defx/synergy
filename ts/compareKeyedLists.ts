const compareKeyedLists = (key = 'id', a = [], b) => {
  let delta = b.map((item, i) =>
    item[key] === undefined
      ? i in a
        ? i
        : -1
      : a.findIndex((v) => v[key] === item[key])
  );

  if (a.length !== b.length || !delta.every((a, b) => a === b)) return delta;
};

export default compareKeyedLists;

function prefixSelectors(prefix, css) {
  let insideBlock = false;
  let look = true;
  let output = '';

  for (let char of css) {
    if (char === '}') {
      insideBlock = false;
      look = true;
    } else if (char === ',') {
      look = true;
    } else if (char === '{') {
      insideBlock = true;
    } else if (look && !insideBlock && !char.match(/\s/)) {
      output += prefix + ' ';
      look = false;
    }
    output += char;
  }
  return output;
}

export default prefixSelectors;

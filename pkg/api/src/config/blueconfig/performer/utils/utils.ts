// With 'in': Prevent error: 'Cannot use 'in' operator to search for {key} in {value}'
export function isObjNotNull(obj) {
  return typeof obj === "object" && obj !== null;
}

export function unroot(text) {
  return (text || "").replace(
    /^(?:root(\.|\[)?|\.(.+))/g,
    (_, b, c) => c || (b === "[" ? "[" : "")
  );
}

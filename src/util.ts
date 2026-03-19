export function indent(s: string) {
  return s
    .split("\n")
    .map((x) => "  " + x)
    .join("\n");
}

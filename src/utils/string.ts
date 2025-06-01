export function toCamelCase(name: string | undefined) {
  if (!name) return '';
  return name.charAt(0).toLowerCase() + name.slice(1);
}

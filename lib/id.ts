export const getId = (id: unknown): string => {
  if (Array.isArray(id)) return id[0];
  return String(id ?? "");
};
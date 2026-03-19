export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function hasEnv(names: string[]): boolean {
  return names.every((n) => Boolean(process.env[n]));
}


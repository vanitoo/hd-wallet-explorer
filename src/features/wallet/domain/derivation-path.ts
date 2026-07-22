export type DerivationPathSegment = Readonly<{
  index: number;
  hardened: boolean;
}>;

export type DerivationPathInfo = Readonly<{
  normalized: string;
  segments: readonly DerivationPathSegment[];
}>;

const MAX_INDEX = 0x7fffffff;

export function parseDerivationPath(value: string): DerivationPathInfo {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Путь деривации не указан.");

  const parts = trimmed.split("/");
  if (parts[0].toLowerCase() !== "m") throw new Error("Путь деривации должен начинаться с m.");
  if (parts.some((part) => part.length === 0)) throw new Error("Путь деривации содержит пустой сегмент.");

  const segments = parts.slice(1).map((part, position) => parseSegment(part, position + 1));
  const normalized = `m${segments.map((segment) => `/${segment.index}${segment.hardened ? "'" : ""}`).join("")}`;
  return { normalized, segments };
}

export function formatDerivationPath(segments: readonly DerivationPathSegment[]): string {
  return `m${segments.map((segment) => `/${validateSegment(segment).index}${segment.hardened ? "'" : ""}`).join("")}`;
}

export function assertDerivationPathPrefix(path: string, prefix: string): string {
  const parsedPath = parseDerivationPath(path);
  const parsedPrefix = parseDerivationPath(prefix);
  if (parsedPrefix.segments.length > parsedPath.segments.length) {
    throw new Error(`Путь должен начинаться с ${parsedPrefix.normalized}`);
  }

  const matches = parsedPrefix.segments.every((segment, index) => {
    const candidate = parsedPath.segments[index];
    return candidate.index === segment.index && candidate.hardened === segment.hardened;
  });
  if (!matches) throw new Error(`Путь должен начинаться с ${parsedPrefix.normalized}`);
  return parsedPath.normalized;
}

export function validateChildIndex(value: number, label = "Индекс"): number {
  if (!Number.isInteger(value) || value < 0 || value > MAX_INDEX) {
    throw new Error(`${label} должен быть целым числом от 0 до ${MAX_INDEX}.`);
  }
  return value;
}

function parseSegment(value: string, position: number): DerivationPathSegment {
  const match = /^(\d+)(['hH]?)$/u.exec(value);
  if (!match) throw new Error(`Некорректный сегмент пути №${position}: ${value}`);

  const index = Number(match[1]);
  validateChildIndex(index, `Сегмент пути №${position}`);
  return { index, hardened: match[2] !== "" };
}

function validateSegment(segment: DerivationPathSegment): DerivationPathSegment {
  validateChildIndex(segment.index);
  return segment;
}

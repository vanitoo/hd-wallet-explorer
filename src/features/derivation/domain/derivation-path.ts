export const MAX_DERIVATION_INDEX = 0x7fffffff;

export type DerivationSegment = Readonly<{
  index: number;
  hardened: boolean;
}>;

export type ParsedDerivationPath = Readonly<{
  absolute: boolean;
  segments: readonly DerivationSegment[];
}>;

export type DerivationPathErrorCode =
  | "EMPTY"
  | "INVALID_ROOT"
  | "EMPTY_SEGMENT"
  | "INVALID_SEGMENT"
  | "INDEX_OUT_OF_RANGE";

export class DerivationPathError extends Error {
  public readonly code: DerivationPathErrorCode;
  public readonly segmentPosition?: number;

  constructor(
    code: DerivationPathErrorCode,
    message: string,
    segmentPosition?: number,
  ) {
    super(message);
    this.name = "DerivationPathError";
    this.code = code;
    this.segmentPosition = segmentPosition;
  }
}

const HARDENED_SUFFIXES = new Set(["'", "h", "H"]);

export function parseDerivationPath(input: string): ParsedDerivationPath {
  const value = input.trim();
  if (!value) {
    throw new DerivationPathError("EMPTY", "Введите путь деривации.");
  }

  const parts = value.split("/");
  const first = parts[0];
  const absolute = first === "m" || first === "M";

  if (!absolute && (first?.toLowerCase() === "m" || value.startsWith("/"))) {
    throw new DerivationPathError("INVALID_ROOT", "Корень пути должен быть записан как m.");
  }

  const segmentParts = absolute ? parts.slice(1) : parts;
  const segments = segmentParts.map((rawSegment, position) =>
    parseSegment(rawSegment, position + 1),
  );

  return { absolute, segments };
}

function parseSegment(rawSegment: string, position: number): DerivationSegment {
  const segment = rawSegment.trim();
  if (!segment) {
    throw new DerivationPathError(
      "EMPTY_SEGMENT",
      `Сегмент ${position} пуст. Проверьте лишний символ «/».`,
      position,
    );
  }

  const suffix = segment.at(-1) ?? "";
  const hardened = HARDENED_SUFFIXES.has(suffix);
  const numericPart = hardened ? segment.slice(0, -1) : segment;

  if (!/^\d+$/.test(numericPart)) {
    throw new DerivationPathError(
      "INVALID_SEGMENT",
      `Сегмент ${position} должен содержать целое неотрицательное число.`,
      position,
    );
  }

  const index = Number(numericPart);
  if (!Number.isSafeInteger(index) || index > MAX_DERIVATION_INDEX) {
    throw new DerivationPathError(
      "INDEX_OUT_OF_RANGE",
      `Индекс в сегменте ${position} должен быть от 0 до ${MAX_DERIVATION_INDEX}.`,
      position,
    );
  }

  return { index, hardened };
}

export function formatDerivationPath(path: ParsedDerivationPath): string {
  const segments = path.segments.map((segment) =>
    `${segment.index}${segment.hardened ? "'" : ""}`,
  );
  return [path.absolute ? "m" : null, ...segments].filter(Boolean).join("/");
}

export function buildDerivationPath(segments: readonly DerivationSegment[]): string {
  return formatDerivationPath({ absolute: true, segments });
}

export function describeDerivationPath(path: ParsedDerivationPath): string[] {
  const labels = ["purpose", "coin type", "account", "change", "address index"];
  return path.segments.map((segment, index) => {
    const label = labels[index] ?? `level ${index + 1}`;
    return `${label}: ${segment.index}${segment.hardened ? " (hardened)" : ""}`;
  });
}

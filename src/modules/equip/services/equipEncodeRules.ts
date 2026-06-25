export interface EquipEncodeDimensions {
  branch: number | string | undefined;
  job: number | string | undefined;
  level: number | string | undefined;
  part: number | string | undefined;
  quality: number | string | undefined;
  seriesNo: number | string | undefined;
  turn: number | string | undefined;
}

export interface EquipGeneratedFieldsPreview {
  descKey: string;
  equipId: number;
  itemId: number;
  nameKey: string;
}

export class EquipEncodeError extends Error {
  readonly fieldKey: keyof EquipEncodeDimensions;
  readonly reason: string;

  constructor(fieldKey: keyof EquipEncodeDimensions, reason: string) {
    super(`${fieldKey}: ${reason}`);
    this.name = "EquipEncodeError";
    this.fieldKey = fieldKey;
    this.reason = reason;
  }
}

export function createEquipGeneratedFieldsPreview(
  dimensions: EquipEncodeDimensions
): EquipGeneratedFieldsPreview {
  const equipId = encodeEquipId(dimensions);

  return {
    equipId,
    itemId: equipId,
    nameKey: `EquipName_${equipId}`,
    descKey: `EquipDes_${equipId}`
  };
}

export function encodeEquipId(dimensions: EquipEncodeDimensions): number {
  const part = parseRequiredInteger("part", dimensions.part);
  const job = parseRequiredInteger("job", dimensions.job);
  const turn = parseRequiredInteger("turn", dimensions.turn);
  const branch = parseRequiredInteger("branch", dimensions.branch);
  const quality = parseRequiredInteger("quality", dimensions.quality);
  const level = parseRequiredInteger("level", dimensions.level);
  const seriesNo = parseRequiredInteger("seriesNo", dimensions.seriesNo);
  const baseId = Number(
    `3${padNumber(part, 2)}${job}${turn}${branch}${quality}${padNumber(level, 3)}`
  );

  return baseId + Math.max(0, seriesNo - 1);
}

function parseRequiredInteger(
  fieldKey: keyof EquipEncodeDimensions,
  value: number | string | undefined
): number {
  if (value === undefined || value === "") {
    throw new EquipEncodeError(fieldKey, "Required dimension is missing");
  }

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new EquipEncodeError(fieldKey, "Dimension must be a non-negative integer");
  }

  return parsedValue;
}

function padNumber(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

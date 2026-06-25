interface EquipQualityTagProps {
  quality: string;
}

export function EquipQualityTag({ quality }: EquipQualityTagProps) {
  const label = quality || "-";

  return <span className={`quality-tag quality-${normalizeQuality(quality)}`}>{label}</span>;
}

function normalizeQuality(quality: string): string {
  return quality.trim().toLocaleLowerCase() || "unknown";
}

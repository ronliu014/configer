import { useState } from "react";

import type { TableRow } from "../../../core/table/tableTypes";
import { createEquipGeneratedFieldsPreview, EquipEncodeError } from "../services/equipEncodeRules";
import type { EquipEncodeDimensions } from "../services/equipEncodeRules";
import type { EquipEditInput } from "../services/equipEditService";

interface EquipEditPageProps {
  mode: "create" | "edit";
  onCancel?: () => void;
  onDeleteConfirm?: () => void;
  onSave?: (input: EquipEditInput) => void;
  row?: TableRow;
}

type EquipEditFormState = Record<keyof EquipEncodeDimensions, string> & {
  icon: string;
  remark: string;
};

const emptyFormState: EquipEditFormState = {
  remark: "",
  part: "",
  job: "",
  turn: "",
  branch: "",
  quality: "",
  level: "",
  seriesNo: "",
  icon: ""
};

export function EquipEditPage({ mode, onCancel, onDeleteConfirm, onSave, row }: EquipEditPageProps) {
  const [formState, setFormState] = useState<EquipEditFormState>(() => createInitialFormState(row));
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const preview = createPreview(formState);

  function updateField(key: keyof EquipEditFormState, value: string): void {
    setFormState((currentFormState) => ({
      ...currentFormState,
      [key]: value
    }));
  }

  return (
    <section className="module-workspace" aria-label="装备编辑">
      <div className="page-heading">
        <p className="eyebrow">业务配置</p>
        <h2>{mode === "create" ? "新增装备" : "编辑装备"}</h2>
      </div>

      <div className="edit-layout">
        <div className="edit-form-grid">
          <TextField label="备注" onChange={(value) => updateField("remark", value)} value={formState.remark} />
          <TextField label="部位" onChange={(value) => updateField("part", value)} value={formState.part} />
          <TextField label="职业" onChange={(value) => updateField("job", value)} value={formState.job} />
          <TextField label="转数" onChange={(value) => updateField("turn", value)} value={formState.turn} />
          <TextField label="分支" onChange={(value) => updateField("branch", value)} value={formState.branch} />
          <TextField label="品质" onChange={(value) => updateField("quality", value)} value={formState.quality} />
          <TextField label="等级" onChange={(value) => updateField("level", value)} value={formState.level} />
          <TextField
            label="第几套"
            onChange={(value) => updateField("seriesNo", value)}
            value={formState.seriesNo}
          />
          <TextField label="图标" onChange={(value) => updateField("icon", value)} value={formState.icon} />
        </div>

        <div className="preview-panel" aria-label="生成预览">
          <h3>生成预览</h3>
          {preview.ok ? (
            <dl className="preview-list">
              <dt>装备 ID</dt>
              <dd>{preview.values.equipId}</dd>
              <dt>item ID</dt>
              <dd>{preview.values.itemId}</dd>
              <dt>Name Key</dt>
              <dd>{preview.values.nameKey}</dd>
              <dt>Desc Key</dt>
              <dd>{preview.values.descKey}</dd>
            </dl>
          ) : (
            <p className="preview-error">{preview.reason}</p>
          )}
        </div>
      </div>

      <div className="form-actions">
        {onCancel ? (
          <button className="secondary-button" onClick={onCancel} type="button">
            取消
          </button>
        ) : null}
        <button className="primary-button" onClick={() => onSave?.(formState)} type="button">
          保存
        </button>
      </div>

      {mode === "edit" ? (
        <div className="danger-zone">
          {isDeleteConfirming ? (
            <>
              <span>确认删除 {String(row?.primaryKey ?? "")}</span>
              <button className="danger-button" onClick={onDeleteConfirm} type="button">
                确认删除
              </button>
            </>
          ) : (
            <button
              className="danger-button"
              onClick={() => setIsDeleteConfirming(true)}
              type="button"
            >
              删除
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}

interface TextFieldProps {
  label: string;
  onChange: (value: string) => void;
  value: string;
}

function TextField({ label, onChange, value }: TextFieldProps) {
  return (
    <label className="field-control">
      <span>{label}</span>
      <input aria-label={label} onChange={(event) => onChange(event.target.value)} value={value} />
    </label>
  );
}

function createInitialFormState(row: TableRow | undefined): EquipEditFormState {
  if (!row) {
    return emptyFormState;
  }

  return {
    remark: cellToText(row.values.remark),
    part: cellToText(row.values.part),
    job: cellToText(row.values.job),
    turn: cellToText(row.values.turn),
    branch: cellToText(row.values.branch),
    quality: cellToText(row.values.quality),
    level: cellToText(row.values.level),
    seriesNo: cellToText(row.values.seriesNo),
    icon: cellToText(row.values.icon)
  };
}

function createPreview(formState: EquipEditFormState) {
  try {
    return {
      ok: true as const,
      values: createEquipGeneratedFieldsPreview(formState)
    };
  } catch (error) {
    if (error instanceof EquipEncodeError) {
      return {
        ok: false as const,
        reason: error.reason
      };
    }

    throw error;
  }
}

function cellToText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

import { describe, expect, it } from "vitest";

import {
  createEquipGeneratedFieldsPreview,
  encodeEquipId,
  EquipEncodeError
} from "../../../src/modules/equip/services/equipEncodeRules";

describe("equipEncodeRules", () => {
  it("encodes equip id from required dimensions", () => {
    const equipId = encodeEquipId({
      part: 1,
      job: 1,
      turn: 0,
      branch: 1,
      quality: 1,
      level: 1,
      seriesNo: 1
    });

    expect(equipId).toBe(3011011001);
  });

  it("offsets repeated equip ids with series number", () => {
    const equipId = encodeEquipId({
      part: 1,
      job: 1,
      turn: 0,
      branch: 1,
      quality: 1,
      level: 1,
      seriesNo: 2
    });

    expect(equipId).toBe(3011011002);
  });

  it("throws a structured error when a required dimension is missing", () => {
    expect(() =>
      encodeEquipId({
        part: 1,
        job: 1,
        turn: 0,
        branch: 1,
        quality: undefined,
        level: 1,
        seriesNo: 1
      })
    ).toThrow(EquipEncodeError);

    try {
      encodeEquipId({
        part: 1,
        job: 1,
        turn: 0,
        branch: 1,
        quality: undefined,
        level: 1,
        seriesNo: 1
      });
    } catch (error) {
      expect(error).toMatchObject({
        name: "EquipEncodeError",
        fieldKey: "quality",
        reason: "Required dimension is missing"
      });
    }
  });

  it("creates generated field preview for equip edit workflow", () => {
    const preview = createEquipGeneratedFieldsPreview({
      part: 1,
      job: 1,
      turn: 0,
      branch: 1,
      quality: 1,
      level: 1,
      seriesNo: 1
    });

    expect(preview).toEqual({
      equipId: 3011011001,
      itemId: 3011011001,
      nameKey: "EquipName_3011011001",
      descKey: "EquipDes_3011011001"
    });
  });
});

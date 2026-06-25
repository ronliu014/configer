import type { ConfigModule } from "../../core/schema/schemaTypes";

export const equipModule: ConfigModule = {
  id: "equip",
  label: "装备",
  targetTables: ["equip", "item", "language"],
  dependencyTables: [
    {
      tableName: "equip_job_group",
      sourcePath: "equip/equip_job_group.xlsx",
      sheetName: "equip_job_group",
      readonly: true
    },
    {
      tableName: "equip_proplib",
      sourcePath: "equip/equip_proplib.xlsx",
      sheetName: "equip_proplib",
      readonly: true
    },
    {
      tableName: "equip_random_proplib",
      sourcePath: "equip/equip_random_proplib.xlsx",
      sheetName: "equip_random_proplib",
      readonly: true
    },
    {
      tableName: "equip_special_drop",
      sourcePath: "equip/equip_special_drop.xlsx",
      sheetName: "equip_special_drop",
      readonly: true
    },
    {
      tableName: "equip_suit",
      sourcePath: "equip/equip_suit.xlsx",
      sheetName: "equip_suit",
      readonly: true
    },
    {
      tableName: "equip_rare",
      sourcePath: "equip/equip_rare.xlsx",
      sheetName: "equip_rare",
      readonly: true
    },
    {
      tableName: "equip_skill_drop",
      sourcePath: "equip/equip_skill_drop.xlsx",
      sheetName: "equip_skill_drop",
      readonly: true
    },
    {
      tableName: "equip_skill_effect",
      sourcePath: "equip/equip_skill_effect.xlsx",
      sheetName: "equip_skill_effect",
      readonly: true
    },
    {
      tableName: "equip_special_prop",
      sourcePath: "equip/equip_special_prop.xlsx",
      sheetName: "equip_special_prop",
      readonly: true
    }
  ]
};

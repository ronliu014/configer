import { equipModule } from "../modules/equip";
import { itemModule } from "../modules/item";
import { languageModule } from "../modules/language";
import type { ConfigModule } from "../core/schema/schemaTypes";

export interface AppModule {
  id: "equip" | "item" | "language";
  label: string;
}

export interface ModuleGroup {
  label: string;
  modules: AppModule[];
}

export const moduleGroups: ModuleGroup[] = [
  {
    label: "业务配置",
    modules: [{ id: "equip", label: "装备" }]
  },
  {
    label: "公共配置",
    modules: [
      { id: "item", label: "item" },
      { id: "language", label: "language" }
    ]
  }
];

export const configModules: ConfigModule[] = [equipModule, itemModule, languageModule];

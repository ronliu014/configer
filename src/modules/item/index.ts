import type { ConfigModule } from "../../core/schema/schemaTypes";

export const itemModule: ConfigModule = {
  id: "item",
  label: "item",
  targetTables: ["item"],
  dependencyTables: []
};

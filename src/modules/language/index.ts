import type { ConfigModule } from "../../core/schema/schemaTypes";

export const languageModule: ConfigModule = {
  id: "language",
  label: "language",
  targetTables: ["language"],
  dependencyTables: []
};

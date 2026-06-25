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

import type { AppModule, ModuleGroup } from "../../app/moduleRegistry";

interface SidebarProps {
  activeModuleId: AppModule["id"];
  groups: ModuleGroup[];
  isLoaded: boolean;
}

export function Sidebar({ activeModuleId, groups, isLoaded }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>configer</h1>
        <span>DD 配置中心</span>
      </div>

      <nav aria-label="配置模块" className="module-nav">
        {groups.map((group) => (
          <section className="module-group" key={group.label}>
            <h2>{group.label}</h2>
            <div className="module-list">
              {group.modules.map((module) => {
                const isActive = module.id === activeModuleId;

                return (
                  <button
                    aria-current={isLoaded && isActive ? "page" : undefined}
                    className={isActive ? "module-button is-active" : "module-button"}
                    disabled={!isLoaded}
                    key={module.id}
                    type="button"
                  >
                    {module.label}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}

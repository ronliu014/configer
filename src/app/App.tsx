import { moduleGroups } from "./moduleRegistry";
import { initialSessionState } from "./sessionState";

export default function App() {
  const session = initialSessionState;

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="配置模块">
        <div className="brand">
          <h1>configer</h1>
          <span>DD 配置中心</span>
        </div>

        <nav className="module-nav">
          {moduleGroups.map((group) => (
            <section className="module-group" key={group.label}>
              <h2>{group.label}</h2>
              <div className="module-list">
                {group.modules.map((module) => (
                  <button
                    className="module-button"
                    disabled={!session.isLoaded}
                    key={module.id}
                    type="button"
                  >
                    {module.label}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </nav>
      </aside>

      <section className="workspace" aria-label="工作区">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">阶段 0</p>
            <h2>装备配置 MVP</h2>
          </div>
          <span className="load-state">未加载 sourceRoot / targetRoot</span>
        </header>

        <section className="empty-state">
          <h2>等待选择配置根目录</h2>
          <p>
            当前脚手架仅建立本地 Web 工程、模块边界和开发命令。后续阶段将接入用户选择的
            sourceRoot 与 targetRoot。
          </p>
        </section>
      </section>
    </main>
  );
}

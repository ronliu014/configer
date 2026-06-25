import { moduleGroups } from "./moduleRegistry";
import { initialSessionState, type SessionState } from "./sessionState";
import { HeaderBar } from "../shared/components/HeaderBar";
import { Sidebar } from "../shared/components/Sidebar";

interface AppProps {
  session?: SessionState;
}

export default function App({ session = initialSessionState }: AppProps) {
  const activeModuleId = "equip";

  return (
    <main className="app-shell">
      <Sidebar activeModuleId={activeModuleId} groups={moduleGroups} isLoaded={session.isLoaded} />

      <section className="workspace" aria-label="工作区">
        <HeaderBar isLoaded={session.isLoaded} subtitle="equip v1.0" title="装备配置" />

        {session.isLoaded ? <EquipListShell /> : <UnloadedWorkspace />}
      </section>
    </main>
  );
}

function UnloadedWorkspace() {
  return (
    <section className="empty-state">
      <h2>等待选择配置根目录</h2>
      <p>sourceRoot 与 targetRoot 选择完成后进入装备配置。</p>
    </section>
  );
}

function EquipListShell() {
  return (
    <section className="module-workspace" aria-label="装备配置">
      <div className="page-heading">
        <p className="eyebrow">业务配置</p>
        <h2>装备列表</h2>
      </div>
    </section>
  );
}

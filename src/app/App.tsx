import { moduleGroups } from "./moduleRegistry";
import { initialSessionState, type SessionState } from "./sessionState";
import { EquipListPage } from "../modules/equip/pages/EquipListPage";
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

        {session.isLoaded ? <EquipListPage rows={session.equipRows ?? []} /> : <UnloadedWorkspace />}
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

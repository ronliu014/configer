interface HeaderBarProps {
  isLoaded: boolean;
  subtitle: string;
  title: string;
}

export function HeaderBar({ isLoaded, subtitle, title }: HeaderBarProps) {
  return (
    <header className="workspace-header">
      <div className="workspace-title">
        <p className="eyebrow">{subtitle}</p>
        <h2>{title}</h2>
      </div>
      <span className={isLoaded ? "load-state is-loaded" : "load-state"}>
        {isLoaded ? "已加载 sourceRoot / targetRoot" : "未加载 sourceRoot / targetRoot"}
      </span>
    </header>
  );
}

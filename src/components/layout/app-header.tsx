const navigation = [
  { label: "Explorer", active: true },
  { label: "Scanner", active: false },
  { label: "Watch-only", active: false },
];

export function AppHeader() {
  return (
    <header className="app-header">
      <a href="#main" className="brand" aria-label="HD Wallet Explorer">
        <span className="brand-icon" aria-hidden="true">H</span>
        <span><strong>HD Wallet</strong><small>Explorer</small></span>
      </a>

      <nav aria-label="Основная навигация">
        {navigation.map((item) => (
          <span key={item.label} className={item.active ? "nav-item active" : "nav-item disabled"}>
            {item.label}
            {!item.active && <small>скоро</small>}
          </span>
        ))}
      </nav>

      <div className="header-actions">
        <span className="local-label"><i aria-hidden="true" /> Offline</span>
        <a className="github-link" href="https://github.com/OWNER/hd-wallet-explorer" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </header>
  );
}

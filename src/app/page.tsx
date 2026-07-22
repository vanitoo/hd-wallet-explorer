import { AppHeader } from "@/components/layout/app-header";
import { PathWorkbench } from "@/features/derivation/components/path-workbench";

export default function Home() {
  return (
    <div className="app-shell">
      <div className="app-container">
        <AppHeader />
        <main id="main">
          <PathWorkbench />
        </main>
        <footer>
          <span>HD Wallet Explorer · MIT License</span>
          <span>Локальная работа · Без аналитики · Без cookies</span>
        </footer>
      </div>
    </div>
  );
}

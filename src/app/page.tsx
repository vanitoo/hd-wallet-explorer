import { AppShell } from "@/features/wallet/components/app-shell";

export default function Home() {
  return (
    <main className="shell">
      <header>
        <div className="brand"><span>◇</span><div><strong>HD Wallet Explorer</strong><small>Wallet Exploration Suite</small></div></div>
        <span className="offline">● OFFLINE-FIRST</span>
      </header>
      <AppShell />
      <footer><span>v0.11.0 · MIT License</span><span>Без сервера, аналитики и cookies</span></footer>
    </main>
  );
}

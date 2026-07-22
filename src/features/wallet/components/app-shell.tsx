"use client";

import { useState } from "react";
import { DerivationExplorerPanel } from "./derivation-explorer-panel";
import { PathComparisonPanel } from "./path-comparison-panel";
import { SeedExplorerPanel } from "./seed-explorer-panel";
import { WalletExplorer } from "./wallet-explorer";
import { WorkspacePanel } from "./workspace-panel";

type Section = "workspace" | "seed" | "derivation" | "comparison" | "explorer";

const NAVIGATION: ReadonlyArray<Readonly<{
  id: Section;
  icon: string;
  title: string;
  description: string;
  group: "Public workspace" | "Sensitive tools" | "Wallet tools";
}>> = [
  { id: "workspace", icon: "◫", title: "Workspace", description: "Portfolio, history and notes", group: "Public workspace" },
  { id: "seed", icon: "✦", title: "Seed Explorer", description: "BIP39, entropy and master keys", group: "Sensitive tools" },
  { id: "derivation", icon: "⌘", title: "Derivation Explorer", description: "Custom paths and public results", group: "Sensitive tools" },
  { id: "comparison", icon: "≋", title: "Path Comparison", description: "BIP44, 49, 84, 86 and Ethereum", group: "Sensitive tools" },
  { id: "explorer", icon: "◇", title: "Wallet Explorer", description: "Addresses, scanner and watch-only", group: "Wallet tools" },
];

export function AppShell() {
  const [section, setSection] = useState<Section>("workspace");
  const active = NAVIGATION.find((item) => item.id === section) ?? NAVIGATION[0];

  return (
    <div className="app-layout">
      <aside className="app-sidebar" aria-label="Основная навигация">
        <div className="sidebar-intro">
          <span className="safe-badge">v0.11.0</span>
          <strong>Wallet Exploration Suite</strong>
          <p>Локальные инструменты для известных seed, paths и публичных wallet-данных.</p>
        </div>

        {["Public workspace", "Sensitive tools", "Wallet tools"].map((group) => (
          <div className="nav-group" key={group}>
            <span className="nav-group-label">{group}</span>
            {NAVIGATION.filter((item) => item.group === group).map((item) => (
              <button
                key={item.id}
                className={section === item.id ? "nav-item active" : "nav-item"}
                onClick={() => setSection(item.id)}
                aria-current={section === item.id ? "page" : undefined}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span><strong>{item.title}</strong><small>{item.description}</small></span>
              </button>
            ))}
          </div>
        ))}

        <div className="sidebar-security">
          <strong>Security boundary</strong>
          <p>Workspace хранит только публичные данные. Seed-инструменты работают в памяти вкладки.</p>
        </div>
      </aside>

      <div className="app-content">
        <div className="content-heading">
          <div><span className="eyebrow">HD WALLET EXPLORER</span><h1>{active.title}</h1><p>{active.description}</p></div>
          <span className={section === "workspace" || section === "explorer" ? "context-badge public" : "context-badge sensitive"}>
            {section === "workspace" || section === "explorer" ? "PUBLIC DATA" : "SENSITIVE SESSION"}
          </span>
        </div>

        {section === "workspace" ? <section className="panel workspace-panel"><WorkspacePanel /></section> : null}
        {section === "seed" ? <SeedExplorerPanel /> : null}
        {section === "derivation" ? <DerivationExplorerPanel /> : null}
        {section === "comparison" ? <PathComparisonPanel /> : null}
        {section === "explorer" ? <WalletExplorer /> : null}
      </div>
    </div>
  );
}

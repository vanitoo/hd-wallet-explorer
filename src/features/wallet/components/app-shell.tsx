"use client";

import { useState } from "react";
import { SeedExplorerPanel } from "./seed-explorer-panel";
import { WalletExplorer } from "./wallet-explorer";
import { WorkspacePanel } from "./workspace-panel";

type Section = "workspace" | "seed" | "explorer";

export function AppShell(){
  const[section,setSection]=useState<Section>("workspace");
  return <>
    <div className="app-nav" aria-label="Основная навигация">
      <button className={section==="workspace"?"active":""} onClick={()=>setSection("workspace")}><span>◫</span><div><strong>Workspace</strong><small>Portfolio, history, notes</small></div></button>
      <button className={section==="seed"?"active":""} onClick={()=>setSection("seed")}><span>✦</span><div><strong>Seed Explorer</strong><small>BIP39, entropy, master keys</small></div></button>
      <button className={section==="explorer"?"active":""} onClick={()=>setSection("explorer")}><span>◇</span><div><strong>Explorer</strong><small>Derivation, scanner, watch-only</small></div></button>
    </div>
    {section==="workspace"?<section className="panel workspace-panel"><WorkspacePanel/></section>:null}
    {section==="seed"?<SeedExplorerPanel/>:null}
    {section==="explorer"?<WalletExplorer/>:null}
  </>;
}

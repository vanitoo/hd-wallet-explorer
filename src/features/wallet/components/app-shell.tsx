"use client";

import { useState } from "react";
import { WalletExplorer } from "./wallet-explorer";
import { WorkspacePanel } from "./workspace-panel";

type Section = "workspace" | "explorer";

export function AppShell(){
  const[section,setSection]=useState<Section>("workspace");
  return <>
    <div className="app-nav" aria-label="Основная навигация">
      <button className={section==="workspace"?"active":""} onClick={()=>setSection("workspace")}><span>◫</span><div><strong>Workspace</strong><small>Portfolio, history, notes</small></div></button>
      <button className={section==="explorer"?"active":""} onClick={()=>setSection("explorer")}><span>◇</span><div><strong>Explorer</strong><small>Derivation, scanner, watch-only</small></div></button>
    </div>
    {section==="workspace"?<section className="panel workspace-panel"><WorkspacePanel/></section>:<WalletExplorer/>}
  </>;
}

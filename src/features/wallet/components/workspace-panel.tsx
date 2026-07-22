"use client";

import { useMemo, useState } from "react";
import { parseWatchProfiles, type WatchProfile } from "../domain/watch-only";
import {
  ADDRESS_STORAGE_KEY,
  DISCOVERY_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  buildWorkspace,
  createWorkspaceAddress,
  isDiscoverySnapshot,
  isWorkspaceAddress,
  parseStoredArray,
  parseWorkspace,
  type DiscoverySnapshot,
  type WorkspaceAddress,
} from "../domain/workspace";

function readProfiles(): WatchProfile[] {
  return typeof window === "undefined" ? [] : parseWatchProfiles(localStorage.getItem(PROFILE_STORAGE_KEY));
}
function readDiscoveries(): DiscoverySnapshot[] {
  return typeof window === "undefined" ? [] : parseStoredArray(localStorage.getItem(DISCOVERY_STORAGE_KEY), isDiscoverySnapshot);
}
function readAddresses(): WorkspaceAddress[] {
  return typeof window === "undefined" ? [] : parseStoredArray(localStorage.getItem(ADDRESS_STORAGE_KEY), isWorkspaceAddress);
}

export function WorkspacePanel() {
  const [workspaceName, setWorkspaceName] = useState("My Wallet Workspace");
  const [profiles, setProfiles] = useState<WatchProfile[]>(readProfiles);
  const [discoveries, setDiscoveries] = useState<DiscoverySnapshot[]>(readDiscoveries);
  const [addresses, setAddresses] = useState<WorkspaceAddress[]>(readAddresses);
  const [chain, setChain] = useState<"bitcoin" | "ethereum">("bitcoin");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalChecked = discoveries.reduce((sum, item) => sum + item.checked, 0);
  const totalUsed = discoveries.reduce((sum, item) => sum + item.used, 0);
  const totalBalance = discoveries.reduce((sum, item) => sum + item.balanceSats, 0);
  const favoriteCount = addresses.filter((item) => item.favorite).length;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return addresses.filter((item) => (!favoritesOnly || item.favorite) && (!needle || `${item.label} ${item.note} ${item.address} ${item.chain}`.toLowerCase().includes(needle)));
  }, [addresses, favoritesOnly, query]);

  function persistAddresses(next: WorkspaceAddress[]) {
    setAddresses(next);
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next));
  }
  function refresh() {
    setProfiles(readProfiles());
    setDiscoveries(readDiscoveries());
    setAddresses(readAddresses());
    setError(null);
  }
  function addAddress() {
    try {
      const item = createWorkspaceAddress({ chain, address, label, note });
      persistAddresses([item, ...addresses]);
      setAddress(""); setLabel(""); setNote(""); setError(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось добавить адрес"); }
  }
  function toggleFavorite(id: string) {
    persistAddresses(addresses.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item));
  }
  function removeAddress(id: string) { persistAddresses(addresses.filter((item) => item.id !== id)); }
  function exportWorkspace() {
    const body = JSON.stringify(buildWorkspace(workspaceName, profiles, discoveries, addresses), null, 2);
    const blob = new Blob([body], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "wallet-project.json"; anchor.click(); URL.revokeObjectURL(url);
  }
  async function importWorkspace(file: File | undefined) {
    if (!file) return;
    try {
      const workspace = parseWorkspace(await file.text());
      setWorkspaceName(workspace.name); setProfiles(workspace.profiles); setDiscoveries(workspace.discoveries); setAddresses(workspace.addresses);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(workspace.profiles));
      localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(workspace.discoveries));
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(workspace.addresses));
      setError(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось импортировать workspace"); }
  }

  return <div className="workspace">
    <div className="workspace-head"><div><span className="eyebrow">Portfolio & history</span><h2>Wallet Workspace</h2><p>Сводка watch-only профилей, результатов discovery, избранных адресов и заметок.</p></div><div className="actions compact"><button className="secondary" onClick={refresh}>Обновить данные</button><button className="primary" onClick={exportWorkspace}>Экспорт workspace</button><label className="file-button">Импорт JSON<input type="file" accept="application/json,.json" onChange={event=>void importWorkspace(event.target.files?.[0])}/></label></div></div>

    <div className="workspace-name"><label>Название workspace<input value={workspaceName} onChange={event=>setWorkspaceName(event.target.value)}/></label></div>
    <div className="dashboard-grid">
      <Metric label="Watch-only профили" value={profiles.length}/><Metric label="Discovery запусков" value={discoveries.length}/><Metric label="Проверено адресов" value={totalChecked}/><Metric label="Использовано" value={totalUsed}/><Metric label="Баланс Bitcoin" value={`${(totalBalance/100_000_000).toFixed(8)} BTC`}/><Metric label="Избранные" value={favoriteCount}/>
    </div>

    <div className="workspace-columns">
      <section className="section-card"><div className="section-heading"><div><h3>Последние discovery</h3><p>Сохранённые результаты из Watch-only.</p></div></div>{discoveries.length===0?<Empty text="Запустите discovery во вкладке Watch-only."/>:<div className="snapshot-list">{discoveries.slice(0,8).map(item=><article className="snapshot-card" key={item.id}><div><strong>{item.profileName||"Watch-only wallet"}</strong><span>{new Date(item.createdAt).toLocaleString("ru-RU")}</span></div><div className="snapshot-metrics"><span>{item.network}</span><span>{item.used} used</span><span>{(item.balanceSats/100_000_000).toFixed(8)} BTC</span></div></article>)}</div>}</section>
      <section className="section-card"><div className="section-heading"><div><h3>Публичные профили</h3><p>Seed и приватные ключи здесь не сохраняются.</p></div></div>{profiles.length===0?<Empty text="Сохранённых профилей пока нет."/>:<div className="profile-mini-list">{profiles.map(item=><article key={item.id}><div><strong>{item.name}</strong><span>{new Date(item.createdAt).toLocaleDateString("ru-RU")}</span></div><code>{item.extendedPublicKey}</code></article>)}</div>}</section>
    </div>

    <section className="section-card address-book"><div className="section-heading"><div><h3>Адресная книга</h3><p>Метки, заметки и избранные публичные адреса.</p></div></div><div className="grid3"><label>Сеть<select value={chain} onChange={event=>setChain(event.target.value as "bitcoin"|"ethereum")}><option value="bitcoin">Bitcoin</option><option value="ethereum">Ethereum</option></select></label><label>Название<input value={label} onChange={event=>setLabel(event.target.value)} placeholder="Cold Wallet"/></label><label>Публичный адрес<input value={address} onChange={event=>setAddress(event.target.value)} placeholder="bc1… / 0x…"/></label></div><label>Заметка<textarea value={note} onChange={event=>setNote(event.target.value)} placeholder="Назначение адреса, устройство, источник…"/></label><button className="primary" onClick={addAddress}>Добавить адрес</button>{error&&<div className="error">{error}</div>}
      <div className="address-toolbar"><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Поиск по адресу, метке или заметке"/><label className="network-consent"><input type="checkbox" checked={favoritesOnly} onChange={event=>setFavoritesOnly(event.target.checked)}/> Только избранные</label></div>
      {filtered.length===0?<Empty text="Адресов по выбранному фильтру нет."/>:<div className="address-cards">{filtered.map(item=><article key={item.id} className={item.favorite?"favorite":""}><button className="star" title="Избранное" onClick={()=>toggleFavorite(item.id)}>{item.favorite?"★":"☆"}</button><div><strong>{item.label}</strong><span>{item.chain}</span><code>{item.address}</code>{item.note&&<p>{item.note}</p>}</div><button className="danger-button" onClick={()=>removeAddress(item.id)}>Удалить</button></article>)}</div>}
    </section>
  </div>;
}

function Metric({label,value}:{label:string;value:string|number}){return <article className="metric-card"><span>{label}</span><strong>{value}</strong></article>}
function Empty({text}:{text:string}){return <div className="empty-state">{text}</div>}

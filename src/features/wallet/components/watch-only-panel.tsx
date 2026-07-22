"use client";

import { useEffect,useMemo,useState } from "react";
import { rowsToCsv,rowsToJson,type AddressRow } from "../domain/range";
import { createWatchProfile,deriveWatchOnlyRange,inspectWatchKey,parseWatchProfiles,type WatchProfile } from "../domain/watch-only";

const STORAGE_KEY="hd-wallet-explorer.watch-only-profiles.v1";

export function WatchOnlyPanel(){
  const[key,setKey]=useState("");
  const[name,setName]=useState("");
  const[change,setChange]=useState<0|1>(0);
  const[start,setStart]=useState(0);
  const[count,setCount]=useState(20);
  const[rows,setRows]=useState<AddressRow[]>([]);
  const[profiles,setProfiles]=useState<WatchProfile[]>([]);
  const[error,setError]=useState<string|null>(null);
  const info=useMemo(()=>{try{return key.trim()?inspectWatchKey(key):null}catch{return null}},[key]);

  useEffect(()=>setProfiles(parseWatchProfiles(localStorage.getItem(STORAGE_KEY))),[]);

  function derive(){
    try{setError(null);setRows(deriveWatchOnlyRange({extendedPublicKey:key,change,start,count}))}
    catch(e){setRows([]);setError(e instanceof Error?e.message:"Ошибка watch-only деривации")}
  }

  function save(){
    try{
      const profile=createWatchProfile(name,key);
      const next=[profile,...profiles.filter(item=>item.extendedPublicKey!==profile.extendedPublicKey)];
      setProfiles(next);localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setName("");setError(null);
    }catch(e){setError(e instanceof Error?e.message:"Не удалось сохранить профиль")}
  }

  function load(profile:WatchProfile){setKey(profile.extendedPublicKey);setName(profile.name);setRows([]);setError(null)}
  function remove(id:string){const next=profiles.filter(item=>item.id!==id);setProfiles(next);localStorage.setItem(STORAGE_KEY,JSON.stringify(next))}
  function download(kind:"csv"|"json"){
    const body=kind==="csv"?rowsToCsv(rows):rowsToJson(rows);
    const blob=new Blob([body],{type:kind==="csv"?"text/csv;charset=utf-8":"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download=`watch-only-addresses.${kind}`;anchor.click();URL.revokeObjectURL(url);
  }

  return <div className="watch-only">
    <div className="watch-intro"><div><h2>Watch-only кошелёк</h2><p>Создавайте и сканируйте Bitcoin-адреса без seed-фразы и приватных ключей.</p></div><span className="safe-badge">Только публичные данные</span></div>
    <div className="warning">Поддерживаются account-level ключи xpub, ypub, zpub, tpub, upub и vpub. Taproot watch-only будет добавлен отдельно.</div>
    <label>Расширенный публичный ключ<textarea value={key} onChange={e=>{setKey(e.target.value);setRows([])}} placeholder="xpub… / ypub… / zpub… / tpub… / upub… / vpub…"/></label>
    {key&&<div className={info?"key-info":"error"}>{info?`${info.prefix.toUpperCase()} · ${info.network} · ${formatType(info.type)} · depth ${info.depth}`:"Ключ пока не распознан"}</div>}
    <div className="grid3"><label>Ветка<select value={change} onChange={e=>setChange(Number(e.target.value) as 0|1)}><option value={0}>External · 0</option><option value={1}>Change · 1</option></select></label><label>Начальный индекс<input type="number" min={0} value={start} onChange={e=>setStart(e.target.valueAsNumber)}/></label><label>Количество, максимум 1000<input type="number" min={1} max={1000} value={count} onChange={e=>setCount(e.target.valueAsNumber)}/></label></div>
    <div className="actions"><button className="primary" onClick={derive}>Сформировать адреса</button><button className="secondary" onClick={()=>{setKey("");setRows([]);setError(null)}}>Очистить</button></div>
    <div className="profile-save"><label>Имя профиля<input value={name} onChange={e=>setName(e.target.value)} placeholder="Например, Ledger Bitcoin"/></label><button className="secondary" disabled={!info} onClick={save}>Сохранить публичный профиль</button></div>
    {error&&<div className="error">{error}</div>}
    {profiles.length>0&&<div className="profiles"><h3>Сохранённые профили</h3>{profiles.map(profile=><div className="profile-card" key={profile.id}><div><strong>{profile.name}</strong><code>{profile.extendedPublicKey}</code></div><div><button onClick={()=>load(profile)}>Открыть</button><button onClick={()=>remove(profile.id)}>Удалить</button></div></div>)}</div>}
    {rows.length>0&&<div className="range-result"><div className="range-summary"><div><strong>{rows.length} адресов</strong><span>Индексы {rows[0].index}–{rows.at(-1)?.index}</span></div><div className="actions compact"><button className="secondary" onClick={()=>download("csv")}>Скачать CSV</button><button className="secondary" onClick={()=>download("json")}>Скачать JSON</button></div></div><div className="address-table"><table><thead><tr><th>Index</th><th>Path</th><th>Address</th><th></th></tr></thead><tbody>{rows.map(row=><tr key={row.path}><td>{row.index}</td><td><code>{row.path}</code></td><td><code>{row.address}</code></td><td><CopyButton value={row.address}/></td></tr>)}</tbody></table></div></div>}
  </div>
}

function formatType(type:string){return type==="legacy"?"Legacy":type==="nested-segwit"?"Nested SegWit":"Native SegWit"}
function CopyButton({value}:{value:string}){async function copy(){await navigator.clipboard.writeText(value)}return <button onClick={copy}>Копировать</button>}

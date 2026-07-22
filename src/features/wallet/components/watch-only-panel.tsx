"use client";

import { useEffect,useMemo,useRef,useState } from "react";
import { discoverWatchOnly,formatBitcoinSats,type DiscoveryResult } from "../domain/discovery";
import { rowsToCsv,rowsToJson,type AddressRow } from "../domain/range";
import { createWatchProfile,deriveWatchOnlyRange,inspectWatchKey,parseWatchProfiles,type WatchProfile } from "../domain/watch-only";

const STORAGE_KEY="hd-wallet-explorer.watch-only-profiles.v1";

export function WatchOnlyPanel(){
  const[key,setKey]=useState(""); const[name,setName]=useState(""); const[change,setChange]=useState<0|1>(0);
  const[start,setStart]=useState(0); const[count,setCount]=useState(20); const[rows,setRows]=useState<AddressRow[]>([]);
  const[profiles,setProfiles]=useState<WatchProfile[]>([]); const[error,setError]=useState<string|null>(null);
  const[addressGap,setAddressGap]=useState(20); const[maxAddresses,setMaxAddresses]=useState(100);
  const[endpoint,setEndpoint]=useState("https://mempool.space/api"); const[networkEnabled,setNetworkEnabled]=useState(false);
  const[discovering,setDiscovering]=useState(false); const[progress,setProgress]=useState(0); const[message,setMessage]=useState("");
  const[discovery,setDiscovery]=useState<DiscoveryResult|null>(null); const abortRef=useRef<AbortController|null>(null);
  const info=useMemo(()=>{try{return key.trim()?inspectWatchKey(key):null}catch{return null}},[key]);

  useEffect(()=>setProfiles(parseWatchProfiles(localStorage.getItem(STORAGE_KEY))),[]);
  useEffect(()=>{if(info)setEndpoint(info.network==="mainnet"?"https://mempool.space/api":"https://mempool.space/testnet/api")},[info]);

  function resetResults(){abortRef.current?.abort();setRows([]);setDiscovery(null);setProgress(0);setMessage("");setError(null)}
  function derive(){try{setError(null);setRows(deriveWatchOnlyRange({extendedPublicKey:key,change,start,count}))}catch(e){setRows([]);setError(e instanceof Error?e.message:"Ошибка watch-only деривации")}}
  function save(){try{const profile=createWatchProfile(name,key);const next=[profile,...profiles.filter(item=>item.extendedPublicKey!==profile.extendedPublicKey)];setProfiles(next);localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setName("");setError(null)}catch(e){setError(e instanceof Error?e.message:"Не удалось сохранить профиль")}}
  function load(profile:WatchProfile){setKey(profile.extendedPublicKey);setName(profile.name);resetResults()}
  function remove(id:string){const next=profiles.filter(item=>item.id!==id);setProfiles(next);localStorage.setItem(STORAGE_KEY,JSON.stringify(next))}
  async function runDiscovery(){
    if(!networkEnabled){setError("Подтвердите отправку публичных адресов в API.");return}
    const controller=new AbortController();abortRef.current=controller;setDiscovering(true);setDiscovery(null);setProgress(0);setError(null);setMessage("Запуск обнаружения…");
    try{
      const result=await discoverWatchOnly({extendedPublicKey:key,endpoint,addressGap,maxAddresses,retries:2,timeoutMs:15000,requestDelayMs:120,signal:controller.signal,onProgress:(completed,total,row,branch)=>{setProgress(Math.min(100,Math.round(completed/total*100)));setMessage(`${branch===0?"External":"Change"} · индекс ${row.index} · проверено ${completed}`)}});
      setDiscovery(result);setMessage(`Готово. Проверено ${result.checked}, использовано ${result.used}.`);setProgress(100);
    }catch(e){if(e instanceof DOMException&&e.name==="AbortError")setMessage("Обнаружение остановлено.");else setError(e instanceof Error?e.message:"Ошибка обнаружения")}
    finally{setDiscovering(false);abortRef.current=null}
  }
  function download(kind:"csv"|"json",source:AddressRow[]){const body=kind==="csv"?rowsToCsv(source):rowsToJson(source);const blob=new Blob([body],{type:kind==="csv"?"text/csv;charset=utf-8":"application/json;charset=utf-8"});const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download=`watch-only-addresses.${kind}`;anchor.click();URL.revokeObjectURL(url)}

  return <div className="watch-only">
    <div className="watch-intro"><div><h2>Watch-only кошелёк</h2><p>Создавайте адреса и выполняйте discovery без seed-фразы и приватных ключей.</p></div><span className="safe-badge">Только публичные данные</span></div>
    <div className="warning">Поддерживаются account-level xpub, ypub, zpub, tpub, upub и vpub. Из такого ключа можно исследовать External и Change текущего аккаунта. Соседние account 1, 2 и далее недоступны из-за hardened-деривации BIP44.</div>
    <label>Расширенный публичный ключ<textarea value={key} onChange={e=>{setKey(e.target.value);resetResults()}} placeholder="xpub… / ypub… / zpub… / tpub… / upub… / vpub…"/></label>
    {key&&<div className={info?"key-info":"error"}>{info?`${info.prefix.toUpperCase()} · ${info.network} · ${formatType(info.type)} · depth ${info.depth}`:"Ключ пока не распознан"}</div>}

    <div className="section-card"><h3>Ручная генерация</h3><div className="grid3"><label>Ветка<select value={change} onChange={e=>setChange(Number(e.target.value) as 0|1)}><option value={0}>External · 0</option><option value={1}>Change · 1</option></select></label><NumberField label="Начальный индекс" value={start} min={0} onChange={setStart}/><NumberField label="Количество" value={count} min={1} max={1000} onChange={setCount}/></div><div className="actions"><button className="primary" disabled={!info} onClick={derive}>Сформировать адреса</button><button className="secondary" onClick={()=>{setKey("");resetResults()}}>Очистить</button></div></div>

    <div className="section-card discovery-card"><div className="scanner-title"><div><h3>Discovery Engine v1</h3><span>Проверяет обе ветки и останавливается по address gap.</span></div><span className={`scanner-state ${discovering?"running":"ready"}`}>{discovering?"Выполняется":"Готов"}</span></div><div className="grid3"><NumberField label="Address gap" value={addressGap} min={1} max={100} onChange={setAddressGap}/><NumberField label="Максимум адресов на ветку" value={maxAddresses} min={addressGap} max={1000} onChange={setMaxAddresses}/><label>Bitcoin Esplora API<input value={endpoint} onChange={e=>setEndpoint(e.target.value)}/></label></div><label className="network-consent"><input type="checkbox" checked={networkEnabled} onChange={e=>setNetworkEnabled(e.target.checked)}/> Я разрешаю отправку публичных адресов в указанный API</label><div className="actions"><button className="primary" disabled={!info||!networkEnabled||discovering} onClick={runDiscovery}>Запустить discovery</button>{discovering&&<button className="secondary" onClick={()=>abortRef.current?.abort()}>Остановить</button>}</div><progress max={100} value={progress}/>{message&&<div className="scan-message">{message}</div>}</div>

    <div className="profile-save"><label>Имя профиля<input value={name} onChange={e=>setName(e.target.value)} placeholder="Например, Ledger Bitcoin"/></label><button className="secondary" disabled={!info} onClick={save}>Сохранить публичный профиль</button></div>
    {error&&<div className="error">{error}</div>}
    {profiles.length>0&&<div className="profiles"><h3>Сохранённые профили</h3>{profiles.map(profile=><div className="profile-card" key={profile.id}><div><strong>{profile.name}</strong><code>{profile.extendedPublicKey}</code></div><div><button onClick={()=>load(profile)}>Открыть</button><button onClick={()=>remove(profile.id)}>Удалить</button></div></div>)}</div>}

    {discovery&&<div className="discovery-result"><div className="scan-stats"><span>Проверено <strong>{discovery.checked}</strong></span><span>Использовано <strong>{discovery.used}</strong></span><span>Ошибок <strong>{discovery.errors}</strong></span><span>Баланс <strong>{formatBitcoinSats(discovery.balanceSats)}</strong></span></div>{discovery.branches.map(branch=><div className="branch-card" key={branch.change}><div><strong>{branch.label} · {branch.change}</strong><span>{branch.rows.length} проверено · {branch.used} использовано</span></div><div className="address-table"><table><thead><tr><th>Index</th><th>Address</th><th>Balance</th><th>Tx</th><th>Status</th></tr></thead><tbody>{branch.rows.map(row=><tr key={row.path}><td>{row.index}</td><td><code>{row.address}</code></td><td>{row.balance}</td><td>{row.transactionCount}</td><td><span className={`status ${row.status}`}>{row.status==="used"?"Использован":row.status==="unused"?"Пустой":"Ошибка"}</span></td></tr>)}</tbody></table></div></div>)}</div>}

    {rows.length>0&&<div className="range-result"><div className="range-summary"><div><strong>{rows.length} адресов</strong><span>Индексы {rows[0].index}–{rows.at(-1)?.index}</span></div><div className="actions compact"><button className="secondary" onClick={()=>download("csv",rows)}>Скачать CSV</button><button className="secondary" onClick={()=>download("json",rows)}>Скачать JSON</button></div></div><div className="address-table"><table><thead><tr><th>Index</th><th>Path</th><th>Address</th><th></th></tr></thead><tbody>{rows.map(row=><tr key={row.path}><td>{row.index}</td><td><code>{row.path}</code></td><td><code>{row.address}</code></td><td><CopyButton value={row.address}/></td></tr>)}</tbody></table></div></div>}
  </div>
}

function NumberField({label,value,min,max,onChange}:{label:string;value:number;min:number;max?:number;onChange:(value:number)=>void}){return <label>{label}<input type="number" value={Number.isFinite(value)?value:""} min={min} max={max} onChange={e=>onChange(e.target.valueAsNumber)}/></label>}
function formatType(type:string){return type==="legacy"?"Legacy":type==="nested-segwit"?"Nested SegWit":"Native SegWit"}
function CopyButton({value}:{value:string}){async function copy(){await navigator.clipboard.writeText(value)}return <button onClick={copy}>Копировать</button>}

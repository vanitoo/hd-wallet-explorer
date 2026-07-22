"use client";

import { useMemo,useState } from "react";
import { bitcoinPath,deriveBitcoin,type BitcoinNetwork,type BitcoinResult,type BitcoinType } from "../domain/bitcoin";
import { deriveEthereum,inspectMnemonic,type EthereumResult } from "../domain/ethereum";
import { buildIndexRange,rowsToCsv,rowsToJson,type AddressRow } from "../domain/range";

const DEMO="test test test test test test test test test test test junk";
type Chain="ethereum"|"bitcoin";
type Mode="single"|"range";
type Result={chain:"ethereum";value:EthereumResult}|{chain:"bitcoin";value:BitcoinResult};

export function WalletExplorer(){
  const[chain,setChain]=useState<Chain>("ethereum");
  const[mode,setMode]=useState<Mode>("single");
  const[mnemonic,setMnemonic]=useState("");
  const[passphrase,setPassphrase]=useState("");
  const[type,setType]=useState<BitcoinType>("native-segwit");
  const[network,setNetwork]=useState<BitcoinNetwork>("mainnet");
  const[account,setAccount]=useState(0);
  const[change,setChange]=useState<0|1>(0);
  const[index,setIndex]=useState(0);
  const[ethIndex,setEthIndex]=useState(0);
  const[rangeStart,setRangeStart]=useState(0);
  const[rangeCount,setRangeCount]=useState(20);
  const[result,setResult]=useState<Result|null>(null);
  const[rows,setRows]=useState<AddressRow[]>([]);
  const[error,setError]=useState<string|null>(null);
  const[show,setShow]=useState(false);
  const validation=useMemo(()=>inspectMnemonic(mnemonic),[mnemonic]);
  const activeIndex=chain==="ethereum"?ethIndex:index;
  const path=chain==="ethereum"?`m/44'/60'/0'/0/${activeIndex}`:bitcoinPath(type,network,account,change,activeIndex);

  function resetOutput(){setResult(null);setRows([]);setError(null);setShow(false)}
  function derive(){
    try{
      resetOutput();
      setResult(chain==="ethereum"
        ?{chain,value:deriveEthereum({mnemonic,passphrase,path})}
        :{chain,value:deriveBitcoin({mnemonic,passphrase,path,network,type})});
    }catch(e){setError(e instanceof Error?e.message:"Ошибка деривации")}
  }
  function deriveRange(){
    try{
      resetOutput();
      const nextRows=buildIndexRange(rangeStart,rangeCount).map(currentIndex=>{
        const currentPath=chain==="ethereum"
          ?`m/44'/60'/0'/0/${currentIndex}`
          :bitcoinPath(type,network,account,change,currentIndex);
        const value=chain==="ethereum"
          ?deriveEthereum({mnemonic,passphrase,path:currentPath})
          :deriveBitcoin({mnemonic,passphrase,path:currentPath,network,type});
        return{index:currentIndex,path:currentPath,address:value.address,publicKey:value.publicKey};
      });
      setRows(nextRows);
    }catch(e){setError(e instanceof Error?e.message:"Ошибка генерации диапазона")}
  }
  function clear(){setMnemonic("");setPassphrase("");resetOutput()}
  function download(kind:"csv"|"json"){
    const body=kind==="csv"?rowsToCsv(rows):rowsToJson(rows);
    const blob=new Blob([body],{type:kind==="csv"?"text/csv;charset=utf-8":"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement("a");
    anchor.href=url;anchor.download=`hd-wallet-addresses-${chain}.${kind}`;anchor.click();URL.revokeObjectURL(url);
  }

  return <>
    <section className="hero"><h1>Откройте любой узел HD-дерева</h1><p>Локально получите один адрес или безопасно сформируйте диапазон публичных адресов. Seed и приватные ключи не отправляются в сеть.</p></section>
    <section className="panel">
      <div className="tabs"><button className={chain==="ethereum"?"active":""} onClick={()=>{setChain("ethereum");resetOutput()}}>Ethereum</button><button className={chain==="bitcoin"?"active":""} onClick={()=>{setChain("bitcoin");resetOutput()}}>Bitcoin</button></div>
      <div className="subtabs mode-tabs"><button className={mode==="single"?"active":""} onClick={()=>{setMode("single");resetOutput()}}>Один адрес</button><button className={mode==="range"?"active":""} onClick={()=>{setMode("range");resetOutput()}}>Диапазон адресов</button></div>
      {chain==="bitcoin"&&<><div className="subtabs"><button className={network==="mainnet"?"active":""} onClick={()=>{setNetwork("mainnet");resetOutput()}}>Mainnet</button><button className={network==="testnet"?"active":""} onClick={()=>{setNetwork("testnet");resetOutput()}}>Testnet</button></div><div className="types">{([['legacy','Legacy · BIP44'],['nested-segwit','Nested · BIP49'],['native-segwit','Native · BIP84'],['taproot','Taproot · BIP86']] as const).map(([id,title])=><button key={id} className={type===id?"active":""} onClick={()=>{setType(id);resetOutput()}}>{title}</button>)}</div></>}
      {mode==="single"?(chain==="ethereum"?<div className="grid3"><label>Address index<input type="number" min={0} value={ethIndex} onChange={e=>setEthIndex(e.target.valueAsNumber)}/></label></div>:<div className="grid3"><label>Account<input type="number" min={0} value={account} onChange={e=>setAccount(e.target.valueAsNumber)}/></label><label>Chain<select value={change} onChange={e=>setChange(Number(e.target.value) as 0|1)}><option value={0}>External · 0</option><option value={1}>Change · 1</option></select></label><label>Address index<input type="number" min={0} value={index} onChange={e=>setIndex(e.target.valueAsNumber)}/></label></div>):<div className="grid3">{chain==="bitcoin"&&<><label>Account<input type="number" min={0} value={account} onChange={e=>setAccount(e.target.valueAsNumber)}/></label><label>Chain<select value={change} onChange={e=>setChange(Number(e.target.value) as 0|1)}><option value={0}>External · 0</option><option value={1}>Change · 1</option></select></label></>}<label>Начальный индекс<input type="number" min={0} value={rangeStart} onChange={e=>setRangeStart(e.target.valueAsNumber)}/></label><label>Количество, максимум 100<input type="number" min={1} max={100} value={rangeCount} onChange={e=>setRangeCount(e.target.valueAsNumber)}/></label></div>}
      <div className="path">{mode==="single"?path:`${chain==="ethereum"?"m/44'/60'/0'/0":"выбранный Bitcoin-путь"}/{${rangeStart}…${rangeStart+rangeCount-1}}`}</div>
      <div className="warning">Не вводите рабочую seed-фразу на чужом или заражённом устройстве. Диапазон формируется локально; в таблице сохраняются только публичные данные.</div>
      <label>BIP39 mnemonic<textarea value={mnemonic} onChange={e=>{setMnemonic(e.target.value);resetOutput()}} placeholder="12, 15, 18, 21 или 24 слова"/></label>
      <button className="secondary" onClick={()=>setMnemonic(DEMO)}>Загрузить демо-фразу</button>
      {mnemonic&&<p className={validation.valid?"":"error"}>{validation.valid?`Корректная BIP39-фраза · ${validation.wordCount} слов`:validation.message}</p>}
      <label>BIP39 Passphrase<input type="password" value={passphrase} onChange={e=>setPassphrase(e.target.value)} placeholder="Необязательно"/></label>
      <div className="actions"><button className="primary" disabled={!validation.valid} onClick={mode==="single"?derive:deriveRange}>{mode==="single"?"Получить адрес":"Сформировать диапазон"}</button><button className="secondary" onClick={clear}>Очистить секреты</button></div>
      {error&&<div className="error">{error}</div>}
      {result&&<div className="result"><Row label="Address" value={result.value.address}/><Row label="Public key" value={result.value.publicKey}/>{result.chain==="bitcoin"&&<Row label="WIF" value={show?result.value.wif:"••••••••••••••••••••"}/>}<Row label="Private key" value={show?result.value.privateKey:"••••••••••••••••••••"}/><button className="secondary" onClick={()=>setShow(v=>!v)}>{show?"Скрыть секреты":"Показать приватный ключ и WIF"}</button></div>}
      {rows.length>0&&<div className="range-result"><div className="range-summary"><div><strong>{rows.length} адресов</strong><span>Индексы {rows[0].index}–{rows.at(-1)?.index}</span></div><div className="actions compact"><button className="secondary" onClick={()=>download("csv")}>Скачать CSV</button><button className="secondary" onClick={()=>download("json")}>Скачать JSON</button></div></div><div className="address-table"><table><thead><tr><th>Index</th><th>Path</th><th>Address</th><th></th></tr></thead><tbody>{rows.map(row=><tr key={row.path}><td>{row.index}</td><td><code>{row.path}</code></td><td><code>{row.address}</code></td><td><CopyButton value={row.address}/></td></tr>)}</tbody></table></div></div>}
    </section>
  </>;
}

function Row({label,value}:{label:string;value:string}){return <div className="row"><div><span>{label}</span><strong>{value}</strong></div><CopyButton value={value}/></div>}
function CopyButton({value}:{value:string}){async function copy(){await navigator.clipboard.writeText(value)}return <button onClick={copy}>Копировать</button>}

import assert from "node:assert/strict";
import test from "node:test";
import { HDKey } from "@scure/bip32";
import { createWatchProfile,deriveWatchOnlyRange,inspectWatchKey,parseWatchProfiles } from "../domain/watch-only.ts";

const root=HDKey.fromMasterSeed(Uint8Array.from({length:32},(_,index)=>index));
const xpub=root.publicExtendedKey;

test("inspects an xpub and derives public addresses",()=>{
  const info=inspectWatchKey(xpub);
  assert.equal(info.prefix,"xpub");
  assert.equal(info.network,"mainnet");
  assert.equal(info.type,"legacy");
  const rows=deriveWatchOnlyRange({extendedPublicKey:xpub,change:0,start:0,count:3});
  assert.equal(rows.length,3);
  assert.equal(rows[0].path,"xpub/0/0");
  assert.match(rows[0].address,/^1/u);
  assert.equal(rows[2].index,2);
});

test("rejects private and malformed extended keys",()=>{
  assert.throws(()=>inspectWatchKey(root.privateExtendedKey),/публичным/u);
  assert.throws(()=>inspectWatchKey("xpub-invalid"),/Base58/u);
});

test("creates and safely parses public profiles",()=>{
  const profile=createWatchProfile("Ledger",xpub);
  const parsed=parseWatchProfiles(JSON.stringify([profile,{bad:true}]));
  assert.equal(parsed.length,1);
  assert.equal(parsed[0].name,"Ledger");
  assert.equal(parseWatchProfiles("not-json").length,0);
});

test("validates watch-only ranges",()=>{
  assert.throws(()=>deriveWatchOnlyRange({extendedPublicKey:xpub,change:0,start:0,count:1001}),/1000/u);
  assert.throws(()=>deriveWatchOnlyRange({extendedPublicKey:xpub,change:0,start:-1,count:1}),/Начальный индекс/u);
});

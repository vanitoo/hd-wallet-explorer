import assert from "node:assert/strict";
import test from "node:test";
import { buildWorkspace,createWorkspaceAddress,isWorkspaceAddress,parseStoredArray,parseWorkspace } from "./workspace.ts";

test("creates and validates a public address note",()=>{
  const item=createWorkspaceAddress({chain:"bitcoin",address:"bc1qexample",label:"Cold",note:"Public only"});
  assert.equal(item.label,"Cold");
  assert.equal(item.favorite,false);
  assert.equal(isWorkspaceAddress(item),true);
});

test("workspace survives JSON export and import",()=>{
  const address=createWorkspaceAddress({chain:"ethereum",address:"0x123",label:"Test",note:""});
  const source=buildWorkspace("Demo",[],[],[address]);
  const restored=parseWorkspace(JSON.stringify(source));
  assert.equal(restored.version,1);
  assert.equal(restored.name,"Demo");
  assert.equal(restored.addresses[0].address,"0x123");
});

test("workspace export strips secret-like extra properties",()=>{
  const unsafeProfile={
    id:"profile-1",
    name:"Public profile",
    extendedPublicKey:"xpub-public",
    createdAt:"2026-07-23T00:00:00.000Z",
    mnemonic:"abandon abandon abandon",
    passphrase:"secret",
    xprv:"xprv-secret",
    privateKey:"deadbeef",
  };
  const unsafeAddress={
    ...createWorkspaceAddress({chain:"bitcoin",address:"bc1qpublic",label:"Public",note:""}),
    seed:"seed-secret",
    wif:"wif-secret",
  };
  const workspace=buildWorkspace("Safe",[unsafeProfile],[],[unsafeAddress]);
  const serialized=JSON.stringify(workspace);
  for(const forbidden of ["mnemonic","passphrase","xprv","privateKey","seed-secret","wif-secret"]){
    assert.equal(serialized.includes(forbidden),false);
  }
  assert.equal(serialized.includes("xpub-public"),true);
  assert.equal(serialized.includes("bc1qpublic"),true);
});

test("workspace import strips unknown fields from untrusted JSON",()=>{
  const restored=parseWorkspace(JSON.stringify({
    version:1,
    name:"Imported",
    profiles:[{id:"1",name:"Profile",extendedPublicKey:"xpub-public",createdAt:"now",mnemonic:"secret words"}],
    discoveries:[],
    addresses:[],
    seed:"root-secret",
  }));
  const serialized=JSON.stringify(restored);
  assert.equal(serialized.includes("secret"),false);
  assert.equal(restored.profiles[0].extendedPublicKey,"xpub-public");
});

test("stored array drops invalid values",()=>{
  const parsed=parseStoredArray(JSON.stringify([{id:"bad"},createWorkspaceAddress({chain:"bitcoin",address:"bc1qok",label:"OK",note:""})]),isWorkspaceAddress);
  assert.equal(parsed.length,1);
});

test("rejects unsupported workspace",()=>{
  assert.throws(()=>parseWorkspace('{"version":2}'),/workspace/u);
});

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

test("stored array drops invalid values",()=>{
  const parsed=parseStoredArray(JSON.stringify([{id:"bad"},createWorkspaceAddress({chain:"bitcoin",address:"bc1qok",label:"OK",note:""})]),isWorkspaceAddress);
  assert.equal(parsed.length,1);
});

test("rejects unsupported workspace",()=>{
  assert.throws(()=>parseWorkspace('{"version":2}'),/workspace/u);
});

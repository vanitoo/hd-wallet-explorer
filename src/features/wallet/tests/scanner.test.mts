import assert from "node:assert/strict";
import test from "node:test";
import { formatUnits,normalizeEndpoint,parseRpcHex,shouldStopAfterGap,validateGapLimit,validateRetries,validateTimeout } from "../domain/scanner.ts";

test("normalizes HTTPS and localhost endpoints",()=>{
  assert.equal(normalizeEndpoint("https://rpc.example.org///"),"https://rpc.example.org");
  assert.equal(normalizeEndpoint("http://localhost:8545/"),"http://localhost:8545");
});

test("rejects insecure, invalid and credential-bearing endpoints",()=>{
  assert.throws(()=>normalizeEndpoint("http://rpc.example.org"),/HTTPS/u);
  assert.throws(()=>normalizeEndpoint("not-a-url"),/URL/u);
  assert.throws(()=>normalizeEndpoint("https://user:pass@rpc.example.org"),/логин/u);
});

test("validates scanner limits",()=>{
  assert.equal(validateGapLimit(20),20);
  assert.throws(()=>validateGapLimit(0),/Gap limit/u);
  assert.equal(validateRetries(2),2);
  assert.throws(()=>validateRetries(6),/повторов/u);
  assert.equal(validateTimeout(15000),15000);
  assert.throws(()=>validateTimeout(999),/Таймаут/u);
  assert.equal(shouldStopAfterGap(19,20),false);
  assert.equal(shouldStopAfterGap(20,20),true);
});

test("parses RPC hex and formats units",()=>{
  assert.equal(parseRpcHex("0xde0b6b3a7640000"),1_000_000_000_000_000_000n);
  assert.equal(formatUnits(1_234_500_000n,8,8,"BTC"),"12.345 BTC");
  assert.equal(formatUnits(1_000_000_000_000_000_000n,18,8,"ETH"),"1 ETH");
});

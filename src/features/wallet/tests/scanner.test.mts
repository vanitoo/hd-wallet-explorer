import assert from "node:assert/strict";
import test from "node:test";
import { formatUnits,normalizeEndpoint,parseRpcHex,shouldStopAfterGap,validateGapLimit } from "../domain/scanner.ts";

test("normalizes HTTPS and localhost endpoints",()=>{
  assert.equal(normalizeEndpoint("https://rpc.example.org///"),"https://rpc.example.org");
  assert.equal(normalizeEndpoint("http://localhost:8545/"),"http://localhost:8545");
});

test("rejects insecure remote endpoint",()=>{
  assert.throws(()=>normalizeEndpoint("http://rpc.example.org"),/HTTPS/u);
});

test("validates gap limit",()=>{
  assert.equal(validateGapLimit(20),20);
  assert.throws(()=>validateGapLimit(0),/Gap limit/u);
  assert.equal(shouldStopAfterGap(19,20),false);
  assert.equal(shouldStopAfterGap(20,20),true);
});

test("parses RPC hex and formats units",()=>{
  assert.equal(parseRpcHex("0xde0b6b3a7640000"),1_000_000_000_000_000_000n);
  assert.equal(formatUnits(1_234_500_000n,8,8,"BTC"),"12.345 BTC");
  assert.equal(formatUnits(1_000_000_000_000_000_000n,18,8,"ETH"),"1 ETH");
});

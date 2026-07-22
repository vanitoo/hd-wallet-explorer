import assert from "node:assert/strict";
import test from "node:test";
import { formatBitcoinSats,parseBitcoinBalance } from "../domain/discovery.ts";

test("parses BTC balances into satoshis",()=>{
  assert.equal(parseBitcoinBalance("1 BTC"),100_000_000n);
  assert.equal(parseBitcoinBalance("0.00000001 BTC"),1n);
  assert.equal(parseBitcoinBalance("—"),0n);
});

test("formats satoshis as BTC",()=>{
  assert.equal(formatBitcoinSats(123_450_000n),"1.2345 BTC");
  assert.equal(formatBitcoinSats(0n),"0 BTC");
});

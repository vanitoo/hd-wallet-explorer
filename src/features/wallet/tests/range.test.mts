import assert from "node:assert/strict";
import test from "node:test";
import { buildIndexRange,rowsToCsv,rowsToJson } from "../domain/range.ts";

test("builds a consecutive range",()=>assert.deepEqual(buildIndexRange(7,3),[7,8,9]));
test("rejects oversized ranges",()=>assert.throws(()=>buildIndexRange(0,101),/от 1 до 100/));
test("exports CSV and JSON",()=>{const rows=[{index:0,path:"m/0",address:"abc",publicKey:"02ff"}];assert.match(rowsToCsv(rows),/index,path,address,publicKey/);assert.equal(JSON.parse(rowsToJson(rows))[0].address,"abc");});

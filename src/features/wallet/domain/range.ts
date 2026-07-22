export type AddressRow=Readonly<{index:number;path:string;address:string;publicKey:string}>;

export function buildIndexRange(start:number,count:number,maxCount=100){
  if(!Number.isInteger(start)||start<0||start>0x7fffffff)throw new Error("Начальный индекс должен быть целым от 0 до 2147483647.");
  if(!Number.isInteger(count)||count<1||count>maxCount)throw new Error(`Количество адресов должно быть от 1 до ${maxCount}.`);
  if(start+count-1>0x7fffffff)throw new Error("Диапазон выходит за пределы допустимого индекса.");
  return Array.from({length:count},(_,offset)=>start+offset);
}

export function rowsToCsv(rows:readonly AddressRow[]){
  const escape=(value:string|number)=>`"${String(value).replaceAll('"','""')}"`;
  return ["index,path,address,publicKey",...rows.map(row=>[row.index,row.path,row.address,row.publicKey].map(escape).join(","))].join("\n");
}

export function rowsToJson(rows:readonly AddressRow[]){return JSON.stringify(rows,null,2);}

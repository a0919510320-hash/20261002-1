export type Vendor = {name:string;amount:number};
export type Snapshot = {id:string;label:string;period:string;kind:string;source:string;rows:Vendor[];createdAt:string};
export function normalizeRows(input: unknown): Vendor[] {
 if (!Array.isArray(input) || !input.length || input.length>5000) throw new Error('請提供1至5,000筆廠商資料。');
 const map=new Map<string,number>();
 for(const row of input){
  if(!row || typeof row.name!=='string' || !row.name.trim() || row.name.length>200 || typeof row.amount!=='number' || !Number.isFinite(row.amount) || row.amount<0 || row.amount>1e12) throw new Error('廠商名稱或金額不正確，金額須為非負數。');
  const name=row.name.trim();map.set(name,(map.get(name)||0)+row.amount);
 }
 const rows=Array.from(map,([name,amount])=>({name,amount}));
 if(rows.reduce((a,r)=>a+r.amount,0)<=0)throw new Error('採購總額須大於0。');
 return rows.sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name,'zh-Hant'));
}
export function analyze(input:Vendor[]){
 const rows=normalizeRows(input),total=rows.reduce((s,r)=>s+r.amount,0);let cumulative=0;
 const ranked=rows.map((r,i)=>{const before=cumulative;cumulative+=r.amount;return {...r,rank:i+1,share:r.amount/total,cumulative:cumulative/total,group:before/total<.8?'A':before/total<.95?'B':'C'};});
 return {rows:ranked,total,top10:rows.slice(0,10).reduce((s,r)=>s+r.amount,0)/total,aCount:ranked.filter(r=>r.group==='A').length};
}

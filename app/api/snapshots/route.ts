import { database } from '@/lib/storage';
import { normalizeRows } from '@/lib/analysis';
export async function GET(){
 try{const result=await database().prepare('SELECT * FROM snapshots ORDER BY created_at DESC').all();return Response.json({snapshots:result.results.map((r:any)=>({...r,rows:JSON.parse(r.rows),createdAt:r.created_at}))},{headers:{'Cache-Control':'no-store'}});}
 catch(e){console.error(e);return Response.json({error:'暫時無法讀取已儲存資料，請稍後重試。'},{status:503});}
}
export async function POST(request:Request){
 try{
  if(request.headers.get('origin') && request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'不允許的來源。'},{status:403});
  const text=await request.text();if(text.length>1000000)return Response.json({error:'資料超過儲存上限。'},{status:413});
  const p=JSON.parse(text);
  if(typeof p.label!=='string'||!p.label.trim()||p.label.length>80||typeof p.period!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.period)||!['累計','單期','年度'].includes(p.kind)||typeof p.source!=='string'||p.source.length>250||typeof p.id!=='string'||!/^[-a-zA-Z0-9]{1,60}$/.test(p.id))throw new Error('請確認期間名稱、日期及統計口徑。');
  const rows=normalizeRows(p.rows),createdAt=new Date().toISOString();
  await database().prepare('INSERT INTO snapshots (id,label,period,kind,source,rows,created_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(p.id,p.label.trim(),p.period,p.kind,p.source,JSON.stringify(rows),createdAt).run();
  return Response.json({ok:true},{status:201});
 }catch(e){console.error(e);const msg=e instanceof Error?e.message:'';const expected=/請|金額|廠商/.test(msg);return Response.json({error:expected?msg:'儲存失敗，資料尚未送出成功，請重試。'},{status:expected?400:503});}
}

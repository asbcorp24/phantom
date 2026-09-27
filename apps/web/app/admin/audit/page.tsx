'use client';
import {useEffect,useState} from 'react';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
export default function GlobalAudit(){
 const [rows,setRows]=useState<any[]>([]),[error,setError]=useState('');
 useEffect(()=>{const t=localStorage.getItem('phantom_token')||'';fetch(API+'/api/audit/global',{headers:{Authorization:'Bearer '+t}}).then(async r=>{if(r.status===401||r.status===403){location.href='/login';return [];}if(!r.ok)throw new Error();return r.json();}).then(setRows).catch(()=>setError('Не удалось загрузить журнал'));},[]);
 return <main className="adminPage"><header><div><div className="brand">PHANTOM</div><h1>Глобальный журнал аудита</h1></div><a href="/admin">← Платформа</a></header>{error&&<p className="error">{error}</p>}<div className="panel"><div className="tableWrap"><table><thead><tr><th>Дата</th><th>Организация</th><th>Исполнитель</th><th>Действие</th><th>Объект</th><th>Результат</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td>{new Date(x.createdAt).toLocaleString('ru-RU')}</td><td>{x.organizationId||'—'}</td><td>{x.actor?((x.actor.lastName||'')+' '+(x.actor.firstName||'')).trim()||x.actor.email:'Система'}</td><td>{x.action}</td><td>{x.entityType}{x.entityId?' · '+x.entityId:''}</td><td>{x.result}</td></tr>)}</tbody></table></div>{!rows.length&&!error&&<p>Записей пока нет.</p>}</div></main>
}

'use client';
import {useEffect,useState} from 'react';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
export default function Notifications(){
 const [items,setItems]=useState<any[]>([]);
 const token=()=>localStorage.getItem('phantom_token')||'';
 async function load(){const r=await fetch(API+'/api/notifications',{headers:{Authorization:'Bearer '+token()}});if(!r.ok){location.href='/login';return;}setItems(await r.json());}
 useEffect(()=>{load()},[]);
 async function read(n:any){if(!n.readAt)await fetch(API+'/api/notifications/'+n.id+'/read',{method:'POST',headers:{Authorization:'Bearer '+token()}});const id=n.metadata?.assignmentId?'/learning/'+n.metadata.assignmentId:n.metadata?.requestId?'/requests/'+n.metadata.requestId:null;if(id)location.href=id;else load();}
 return <main className="adminPage"><header><div><div className="brand">PHANTOM</div><h1>Уведомления</h1></div><a href="/dashboard">Главная</a></header><div className="notificationList">{items.map(n=><button onClick={()=>read(n)} className={'notification '+(!n.readAt?'unread':'')} key={n.id}><div><b>{n.title}</b><p>{n.body}</p></div><small>{new Date(n.createdAt).toLocaleString('ru-RU')}</small></button>)}</div>{!items.length&&<div className="panel">Новых уведомлений нет.</div>}</main>
}

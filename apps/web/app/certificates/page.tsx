'use client';
import {useEffect,useState} from 'react';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
export default function Certificates(){
 const [items,setItems]=useState<any[]>([]);
 useEffect(()=>{const t=localStorage.getItem('phantom_token');fetch(API+'/api/certificates/mine',{headers:{Authorization:'Bearer '+t}}).then(r=>r.ok?r.json():Promise.reject()).then(setItems).catch(()=>location.href='/login')},[]);
 return <main className="adminPage"><header><div><div className="brand">PHANTOM</div><h1>Мои сертификаты</h1></div><a href="/dashboard">Главная</a></header><div className="certGrid">{items.map(c=><a href={'/certificates/'+c.id} className="certCard" key={c.id}><small>{c.organization.name}</small><h2>{c.course.title}</h2><b>{c.number}</b><span>Выдан {new Date(c.issuedAt).toLocaleDateString('ru-RU')}</span></a>)}</div>{!items.length&&<div className="panel">Сертификатов пока нет.</div>}</main>
}

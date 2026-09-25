'use client';
import {useEffect,useState} from 'react';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
export default function MyCourses(){
 const [items,setItems]=useState<any[]>([]);
 useEffect(()=>{const t=localStorage.getItem('phantom_token');fetch(API+'/api/assignments/mine',{headers:{Authorization:'Bearer '+t}}).then(r=>{if(!r.ok)throw 0;return r.json()}).then(setItems).catch(()=>location.href='/login')},[]);
 return <main className="adminPage"><header><div><div className="brand">PHANTOM</div><h1>Мои программы</h1></div><a href="/dashboard">Главная</a></header><div className="courseGrid">{items.map(a=><a className="course" href={'/learning/'+a.id} key={a.id}><span>{a.course.mandatory?'Обязательная программа':'Учебная программа'}</span><h3>{a.course.title}</h3><div className="progress"><i style={{width:a.progress+'%'}}/></div><footer><b>{a.progress}%</b><small>{a.dueAt?'До '+new Date(a.dueAt).toLocaleDateString('ru-RU'):'Без срока'}</small></footer></a>)}</div>{!items.length&&<div className="panel">Назначенных программ пока нет.</div>}</main>
}

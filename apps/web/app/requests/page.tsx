'use client';
import {FormEvent,useEffect,useState} from 'react';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
export default function Requests(){
 const [items,setItems]=useState<any[]>([]),[error,setError]=useState('');
 const token=()=>localStorage.getItem('phantom_token')||'';
 async function load(){const r=await fetch(API+'/api/requests',{headers:{Authorization:'Bearer '+token()}});if(!r.ok){location.href='/login';return;}setItems(await r.json());}
 useEffect(()=>{load()},[]);
 async function create(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const r=await fetch(API+'/api/requests',{method:'POST',headers:{Authorization:'Bearer '+token(),'Content-Type':'application/json'},body:JSON.stringify({subject:f.get('subject'),message:f.get('message')})});if(!r.ok){setError('Не удалось создать обращение');return;}e.currentTarget.reset();setError('');load();}
 return <main className="adminPage"><header><div><div className="brand">PHANTOM</div><h1>Обращения</h1></div><a href="/dashboard">Главная</a></header><section className="adminGrid"><form className="card compact" onSubmit={create}><h2>Новое обращение</h2><label>Тема<input name="subject" required/></label><label>Сообщение<textarea name="message" required/></label>{error&&<p className="error">{error}</p>}<button>Отправить</button></form><div className="panel"><h2>Диалоги</h2>{items.map(r=><a className="requestRow" href={'/requests/'+r.id} key={r.id}><div><b>{r.subject}</b><small>{r.author.lastName} {r.author.firstName} · {r._count.messages} сообщ.</small></div><span className={'status '+r.status}>{r.status}</span></a>)}{!items.length&&<p>Обращений пока нет.</p>}</div></section></main>
}

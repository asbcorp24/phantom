'use client';
import {FormEvent,useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
export default function Request(){
 const {id}=useParams<{id:string}>();const [r,setR]=useState<any>(null);
 const token=()=>localStorage.getItem('phantom_token')||'';
 async function load(){const x=await fetch(API+'/api/requests/'+id,{headers:{Authorization:'Bearer '+token()}});if(!x.ok){location.href='/requests';return;}setR(await x.json());}
 useEffect(()=>{load()},[id]);
 async function send(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const x=await fetch(API+'/api/requests/'+id+'/messages',{method:'POST',headers:{Authorization:'Bearer '+token(),'Content-Type':'application/json'},body:JSON.stringify({text:f.get('text')})});if(x.ok){e.currentTarget.reset();setR(await x.json());}}
 async function close(){await fetch(API+'/api/requests/'+id+'/close',{method:'POST',headers:{Authorization:'Bearer '+token()}});load();}
 if(!r)return <main className="center">Загрузка…</main>;
 const me=JSON.parse(localStorage.getItem('phantom_user')||'{}');
 return <main className="chatPage"><header><a href="/requests">← Обращения</a><div><h2>{r.subject}</h2><small>{r.status}</small></div>{me.role!=='EMPLOYEE'&&r.status!=='CLOSED'?<button onClick={close}>Закрыть</button>:<span/>}</header><section className="messages">{r.messages.map((m:any)=><div className={'message '+(m.sender.id===me.id?'mine':'')} key={m.id}><b>{m.sender.firstName} {m.sender.lastName}</b><p>{m.text}</p><small>{new Date(m.createdAt).toLocaleString('ru-RU')}</small></div>)}</section><form className="chatForm" onSubmit={send}><textarea name="text" placeholder="Введите сообщение…" required/><button>Отправить</button></form></main>
}

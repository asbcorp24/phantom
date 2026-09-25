'use client';
import { FormEvent,useEffect,useState } from 'react';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
type Org={id:string;name:string;slug:string;active:boolean;_count:{users:number;courses:number}};
export default function Admin(){
 const [orgs,setOrgs]=useState<Org[]>([]); const [error,setError]=useState('');
 const token=()=>localStorage.getItem('phantom_token')||'';
 async function load(){const r=await fetch(API+'/api/organizations',{headers:{Authorization:'Bearer '+token()}});if(r.status===401||r.status===403){location.href='/login';return;}setOrgs(await r.json());}
 useEffect(()=>{load()},[]);
 async function create(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const r=await fetch(API+'/api/organizations',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({name:f.get('name'),slug:f.get('slug')})});if(!r.ok){const x=await r.json();setError(x.message||'Ошибка');return;}e.currentTarget.reset();setError('');load();}
 return <main className="adminPage"><header><div><div className="brand">PHANTOM</div><h1>Управление платформой</h1></div><a href="/dashboard">Личный кабинет</a></header>
 <section className="adminGrid"><form className="card" onSubmit={create}><h2>Новая организация</h2><label>Название<input name="name" required/></label><label>Идентификатор<input name="slug" pattern="[a-z0-9-]+" required/></label>{error&&<p className="error">{error}</p>}<button>Создать организацию</button></form>
 <div className="panel"><h2>Организации</h2>{orgs.map(o=><article className="org" key={o.id}><div><b>{o.name}</b><small>{o.slug}</small></div><div><span>{o._count.users} сотрудников</span><span>{o._count.courses} курсов</span></div></article>)}</div></section>
 </main>
}

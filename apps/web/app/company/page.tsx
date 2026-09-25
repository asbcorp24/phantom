'use client';
import {FormEvent,useEffect,useState} from 'react';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
type Department={id:string;name:string;_count:{users:number;groups:number}};
type User={id:string;firstName:string;lastName:string;email:string;role:string;position?:string};
export default function Company(){
 const [departments,setDepartments]=useState<Department[]>([]),[users,setUsers]=useState<User[]>([]),[error,setError]=useState('');
 const token=()=>localStorage.getItem('phantom_token')||'';
 const headers=()=>({Authorization:'Bearer '+token()});
 async function load(){
  const [d,u]=await Promise.all([fetch(API+'/api/departments',{headers:headers()}),fetch(API+'/api/users',{headers:headers()})]);
  if(d.status===401||d.status===403){location.href='/login';return;}
  setDepartments(await d.json());setUsers(await u.json());
 }
 useEffect(()=>{load()},[]);
 async function addDepartment(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const r=await fetch(API+'/api/departments',{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({name:f.get('name')})});if(!r.ok){setError('Не удалось создать подразделение');return;}e.currentTarget.reset();load();}
 async function addUser(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const body=Object.fromEntries(f);if(!body.departmentId)delete body.departmentId;const r=await fetch(API+'/api/users',{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify(body)});const x=await r.json();if(!r.ok){setError(Array.isArray(x.message)?x.message.join(', '):x.message);return;}e.currentTarget.reset();setError('');load();}
 return <main className="adminPage"><header><div><div className="brand">PHANTOM</div><h1>Администрирование компании</h1></div><a href="/dashboard">Личный кабинет</a></header>
 {error&&<p className="error">{error}</p>}
 <section className="adminGrid"><div>
  <form className="card compact" onSubmit={addDepartment}><h2>Подразделение</h2><label>Название<input name="name" required/></label><button>Добавить</button></form>
  <form className="card compact topGap" onSubmit={addUser}><h2>Новый сотрудник</h2><label>Имя<input name="firstName" required/></label><label>Фамилия<input name="lastName" required/></label><label>E-mail<input name="email" type="email" required/></label><label>Должность<input name="position"/></label><label>Подразделение<select name="departmentId"><option value="">Без подразделения</option>{departments.map(d=><option value={d.id} key={d.id}>{d.name}</option>)}</select></label><label>Роль<select name="role"><option value="EMPLOYEE">Сотрудник</option><option value="CURATOR">Куратор</option><option value="COMPANY_ADMIN">Администратор</option></select></label><label>Временный пароль<input name="password" type="password" minLength={8} required/></label><button>Создать сотрудника</button></form>
 </div>
 <div className="panel"><h2>Сотрудники <small>{users.length}</small></h2>{users.map(u=><article className="org" key={u.id}><div><b>{u.lastName} {u.firstName}</b><small>{u.email}{u.position?' · '+u.position:''}</small></div><span>{u.role}</span></article>)}<h2 className="topGap">Подразделения</h2>{departments.map(d=><article className="org" key={d.id}><div><b>{d.name}</b><small>{d._count.users} сотрудников</small></div></article>)}</div></section>
 </main>
}

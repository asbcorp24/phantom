'use client';
import {useEffect,useState} from 'react';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
export default function Reports(){
 const [summary,setSummary]=useState<any>(null),[users,setUsers]=useState<any[]>([]);
 useEffect(()=>{const t=localStorage.getItem('phantom_token')||'';const h={Authorization:'Bearer '+t};Promise.all([fetch(API+'/api/reports/summary',{headers:h}),fetch(API+'/api/reports/employees',{headers:h})]).then(async([a,b])=>{if(!a.ok||!b.ok)throw 0;setSummary(await a.json());setUsers(await b.json())}).catch(()=>location.href='/login')},[]);
 if(!summary)return <main className="center">Загрузка отчёта…</main>;
 return <main className="adminPage"><header><div><div className="brand">PHANTOM</div><h1>Отчёты по обучению</h1></div><a href="/company">Администрирование</a></header>
 <div className="stats">{[['Сотрудники',summary.users],['Назначения',summary.assignments],['Завершено',summary.completed],['Просрочено',summary.overdue],['Сертификаты',summary.certificates],['Выполнение',summary.completionRate+'%']].map(x=><div className="stat" key={x[0]}><small>{x[0]}</small><b>{x[1]}</b></div>)}</div>
 <div className="panel tableWrap"><table><thead><tr><th>Сотрудник</th><th>Подразделение</th><th>Курсы</th><th>Тесты</th><th>Сертификаты</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><b>{u.lastName} {u.firstName}</b><small>{u.email}</small></td><td>{u.department?.name||'—'}</td><td>{u.assignments.map((a:any)=><div key={a.id}>{a.course.title}: {a.progress}% · {a.status}</div>)}</td><td>{u.attempts.map((a:any)=><div key={a.id}>{a.test.title}: {a.score??'—'}% · {a.status}</div>)}</td><td>{u.certificates.map((c:any)=><div key={c.id}>{c.course.title}<small>{c.number}</small></div>)}</td></tr>)}</tbody></table></div></main>
}

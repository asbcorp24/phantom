'use client';
import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
export default function Certificate(){
 const {id}=useParams<{id:string}>();const [c,setC]=useState<any>(null);
 useEffect(()=>{const t=localStorage.getItem('phantom_token');fetch(API+'/api/certificates/'+id,{headers:{Authorization:'Bearer '+t}}).then(r=>r.ok?r.json():Promise.reject()).then(setC).catch(()=>location.href='/certificates')},[id]);
 if(!c)return <main className="center">Загрузка…</main>;
 const fio=[c.user.lastName,c.user.firstName,c.user.middleName].filter(Boolean).join(' ');
 return <main className="certificatePage"><div className="certificate"><div className="certBrand">PHANTOM</div><p>ЭЛЕКТРОННЫЙ СЕРТИФИКАТ</p><h1>{fio}</h1><p>успешно завершил(а) программу обучения</p><h2>{c.course.title}</h2><div className="certMeta"><span>№ {c.number}</span><span>{new Date(c.issuedAt).toLocaleDateString('ru-RU')}</span></div><small>{c.organization.name}</small></div><div className="printActions"><button onClick={()=>window.print()}>Печать / сохранить PDF</button><a href="/certificates">К списку сертификатов</a></div></main>
}

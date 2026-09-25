'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login(){
 const router=useRouter();
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault(); setError(''); setLoading(true);
  const fd=new FormData(e.currentTarget);
  try{
   const r=await fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001')+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:fd.get('email'),password:fd.get('password')})});
   const data=await r.json();
   if(!r.ok) throw new Error(data.message||'Ошибка входа');
   localStorage.setItem('phantom_token',data.accessToken);
   localStorage.setItem('phantom_user',JSON.stringify(data.user));
   router.push(data.user.role==='PLATFORM_OWNER'?'/admin':'/dashboard');
  }catch(err:any){setError(err.message||'Ошибка соединения');}
  finally{setLoading(false);}
 }
 return <main className="center"><form className="card" onSubmit={submit}>
  <div className="brand">PHANTOM</div><h1>Вход</h1><p>Используйте корпоративную учётную запись.</p>
  <label>E-mail<input name="email" type="email" required/></label>
  <label>Пароль<input name="password" type="password" required/></label>
  {error&&<p className="error">{error}</p>}
  <button disabled={loading} type="submit">{loading?'Вход...':'Войти'}</button>
 </form></main>
}

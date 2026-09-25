'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login(){
 const router=useRouter();
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(false);
 const [challenge,setChallenge]=useState('');
 async function verify2fa(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError('');setLoading(true);const fd=new FormData(e.currentTarget);
  try{const r=await fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001')+'/api/auth/2fa/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({challengeToken:challenge,code:fd.get('code')})});const data=await r.json();if(!r.ok)throw new Error(data.message||'Неверный код');localStorage.setItem('phantom_token',data.accessToken);localStorage.setItem('phantom_user',JSON.stringify(data.user));router.push(data.user.role==='PLATFORM_OWNER'?'/admin':'/dashboard');}catch(err:any){setError(err.message||'Ошибка проверки');}finally{setLoading(false);}
 }
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault(); setError(''); setLoading(true);
  const fd=new FormData(e.currentTarget);
  try{
   const r=await fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001')+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:fd.get('email'),password:fd.get('password')})});
   const data=await r.json();
   if(!r.ok) throw new Error(data.message||'Ошибка входа');
   if(data.requiresTwoFactor){setChallenge(data.challengeToken);setLoading(false);return;}
   localStorage.setItem('phantom_token',data.accessToken);
   localStorage.setItem('phantom_user',JSON.stringify(data.user));
   router.push(data.user.role==='PLATFORM_OWNER'?'/admin':'/dashboard');
  }catch(err:any){setError(err.message||'Ошибка соединения');}
  finally{setLoading(false);}
 }
 if(challenge)return <main className="center"><form className="card" onSubmit={verify2fa}><div className="brand">PHANTOM</div><h1>Подтверждение входа</h1><p>Введите 6-значный код из приложения-аутентификатора.</p><label>Код<input name="code" inputMode="numeric" autoComplete="one-time-code" required/></label>{error&&<p className="error">{error}</p>}<button disabled={loading}>{loading?'Проверка...':'Подтвердить'}</button></form></main>;
 return <main className="center"><form className="card" onSubmit={submit}>
  <div className="brand">PHANTOM</div><h1>Вход</h1><p>Используйте корпоративную учётную запись.</p>
  <label>E-mail<input name="email" type="email" required/></label>
  <label>Пароль<input name="password" type="password" required/></label>
  {error&&<p className="error">{error}</p>}
  <button disabled={loading} type="submit">{loading?'Вход...':'Войти'}</button>
 </form></main>
}

'use client';
import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
export default function TestPage(){
 const {assignmentId,testId}=useParams<{assignmentId:string;testId:string}>();const [data,setData]=useState<any>(null),[answers,setAnswers]=useState<Record<string,string[]>>({}),[result,setResult]=useState<any>(null),[error,setError]=useState('');
 const token=()=>localStorage.getItem('phantom_token')||'';
 useEffect(()=>{fetch(API+'/api/tests/'+testId+'/assignments/'+assignmentId+'/start',{method:'POST',headers:{Authorization:'Bearer '+token()}}).then(async r=>{const x=await r.json();if(!r.ok)throw new Error(x.message);setData(x)}).catch(e=>setError(e.message||'Не удалось начать тест'))},[]);
 function choose(q:any,id:string,checked:boolean){setAnswers(v=>{const old=v[q.id]||[];return {...v,[q.id]:q.multiple?(checked?[...old,id]:old.filter(x=>x!==id)):[id]}})}
 async function submit(){const body={answers:Object.entries(answers).map(([questionId,optionIds])=>({questionId,optionIds}))};const r=await fetch(API+'/api/tests/attempts/'+data.attemptId+'/submit',{method:'POST',headers:{Authorization:'Bearer '+token(),'Content-Type':'application/json'},body:JSON.stringify(body)});const x=await r.json();if(!r.ok){setError(x.message);return;}setResult(x);}
 if(error)return <main className="center"><div className="card"><h2>Тест недоступен</h2><p>{error}</p><a href={'/learning/'+assignmentId}>Вернуться к курсу</a></div></main>;
 if(!data)return <main className="center">Подготовка теста…</main>;
 if(result)return <main className="center"><div className="card resultCard"><h1>{result.status==='PASSED'?'Тест пройден':'Тест не пройден'}</h1><div className="score">{result.score}%</div><a className="primaryButton" href={'/learning/'+assignmentId}>Вернуться к курсу</a></div></main>;
 return <main className="testPage"><a href={'/learning/'+assignmentId}>← К программе</a><h1>{data.test.title}</h1><p>Проходной результат: {data.test.passingScore}%{data.test.timeLimitSec?' · время '+Math.ceil(data.test.timeLimitSec/60)+' мин.':''}</p>{data.test.questions.map((q:any,i:number)=><section className="question" key={q.id}><h3>{i+1}. {q.text}</h3>{q.options.map((o:any)=><label key={o.id}><input type={q.multiple?'checkbox':'radio'} name={q.id} onChange={e=>choose(q,o.id,e.target.checked)}/><span>{o.text}</span></label>)}</section>)}<button className="learnNext" onClick={submit}>Завершить тест</button></main>
}

'use client';
import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:3001';
export default function Learning(){
 const {id}=useParams<{id:string}>();const [a,setA]=useState<any>(null);const [index,setIndex]=useState(0);
 const token=()=>localStorage.getItem('phantom_token')||'';
 async function load(){const r=await fetch(API+'/api/learning/'+id,{headers:{Authorization:'Bearer '+token()}});if(!r.ok){location.href='/my-courses';return;}setA(await r.json());}
 useEffect(()=>{load()},[id]);
 if(!a)return <main className="center">Загрузка…</main>;
 const materials=a.courseVersion.materials||[],m=materials[index];
 async function next(){const last=index>=materials.length-1;const progress=materials.length?Math.round(((index+1)/materials.length)*100):100;await fetch(API+'/api/learning/'+id+'/progress',{method:'PATCH',headers:{Authorization:'Bearer '+token(),'Content-Type':'application/json'},body:JSON.stringify({progress,completed:last})});if(last){await load();return;}setIndex(index+1);}
 return <main className="learn"><aside><a href="/my-courses">← Мои программы</a><h2>{a.course.title}</h2><div className="progress"><i style={{width:a.progress+'%'}}/></div><small>{a.progress}% пройдено</small><nav>{materials.map((x:any,i:number)=><button className={i===index?'active':''} onClick={()=>setIndex(i)} key={x.id}>{i+1}. {x.title}</button>)}</nav></aside><article className="lesson">{m?<><small>{m.type}</small><h1>{m.title}</h1>{m.type==='TEXT'&&<div className="lessonText">{m.content}</div>}{m.type==='VIDEO'&&<div className="mediaBox"><a href={m.content} target="_blank">Открыть видео</a></div>}{(m.type==='PDF'||m.type==='IMAGE')&&<div className="mediaBox"><a href={m.content||m.filePath} target="_blank">Открыть материал</a></div>}<button className="learnNext" onClick={next}>{index===materials.length-1?'Завершить материалы':'Материал изучен →'}</button>{index===materials.length-1&&a.courseVersion.tests?.map((t:any)=><a className="testLaunch" key={t.id} href={'/test/'+id+'/'+t.id}>Пройти тест: {t.title} →</a>)}</>:<><h1>Материалы курса</h1><p>В этой версии пока нет материалов.</p><button className="learnNext" onClick={next}>Завершить курс</button></>}</article></main>
}

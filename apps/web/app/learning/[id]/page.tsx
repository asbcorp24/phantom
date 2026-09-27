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
 const done=(materialId:string)=>a.materialProgress?.some((p:any)=>p.materialId===materialId&&p.viewed);
 async function mark(viewed=true,position=0){
  if(!m)return;
  const r=await fetch(API+'/api/learning/'+id+'/materials/'+m.id,{method:'PATCH',headers:{Authorization:'Bearer '+token(),'Content-Type':'application/json'},body:JSON.stringify({viewed,position})});
  if(r.ok)await load();
 }
 async function next(){
  if(m&&!done(m.id))await mark(true,0);
  if(index<materials.length-1)setIndex(index+1);
 }
 async function openFile(materialId:string){
  const r=await fetch(API+'/api/files/materials/'+materialId,{headers:{Authorization:'Bearer '+token()}});
  if(!r.ok)return;
  const blob=await r.blob();const url=URL.createObjectURL(blob);window.open(url,'_blank');setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 const materialsReady=a.progress>=100||!materials.some((x:any)=>x.required);
 return <main className="learn"><aside><a href="/my-courses">← Мои программы</a><h2>{a.course.title}</h2><div className="progress"><i style={{width:a.progress+'%'}}/></div><small>{a.progress}% пройдено</small><nav>{materials.map((x:any,i:number)=><button className={i===index?'active':''} onClick={()=>setIndex(i)} key={x.id}>{done(x.id)?'✓ ':''}{i+1}. {x.title}</button>)}</nav></aside><article className="lesson">{m?<><small>{m.type}</small><h1>{m.title}</h1>{m.type==='TEXT'&&<div className="lessonText">{m.content}</div>}{m.type==='VIDEO'&&<div className="mediaBox">{m.hasFile?<button onClick={()=>openFile(m.id)}>Открыть видео</button>:<a href={m.content} target="_blank">Открыть видео</a>}</div>}{(m.type==='PDF'||m.type==='IMAGE')&&<div className="mediaBox"><button onClick={()=>openFile(m.id)}>Открыть материал</button></div>}<button className="learnNext" onClick={next}>{index===materials.length-1?'Материал изучен':'Материал изучен →'}</button>{index===materials.length-1&&materialsReady&&a.courseVersion.tests?.map((t:any)=><a className="testLaunch" key={t.id} href={'/test/'+id+'/'+t.id}>Пройти тест: {t.title} →</a>)}</>:<><h1>Материалы курса</h1><p>В этой версии нет обязательных материалов.</p>{a.courseVersion.tests?.map((t:any)=><a className="testLaunch" key={t.id} href={'/test/'+id+'/'+t.id}>Пройти тест: {t.title} →</a>)}</>}</article></main>
}

const courses=[['Охрана труда','65%','До 12 октября'],['Информационная безопасность','100%','Завершён'],['Вводный курс','20%','До 30 октября']];
export default function Dashboard(){
 return <main className="dashboard"><aside><div className="brand">PHANTOM</div><nav>Главная<br/>Мои программы<br/>Сертификаты<br/>Обращения<br/>ИИ-помощник</nav></aside>
 <section className="content"><header><div><small>Личный кабинет</small><h1>Добро пожаловать</h1></div><div className="avatar">АС</div></header>
 <div className="stats"><article><b>3</b><span>Назначено программ</span></article><article><b>1</b><span>Завершено</span></article><article><b>0</b><span>Просрочено</span></article></div>
 <h2>Мои программы</h2><div className="courseGrid">{courses.map((c)=><article className="course" key={c[0]}><span>Учебная программа</span><h3>{c[0]}</h3><div className="progress"><i style={{width:c[1]}}/></div><footer><b>{c[1]}</b><small>{c[2]}</small></footer></article>)}</div>
 </section></main>
}
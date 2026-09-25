export default function Dashboard(){
 return <main className="dashboard"><aside><div className="brand">PHANTOM</div><nav><a href="/dashboard">Главная</a><a href="/my-courses">Мои программы</a><a href="/certificates">Сертификаты</a><a href="/notifications">Уведомления</a><a href="/requests">Обращения</a><a href="/assistant">ИИ-помощник</a></nav></aside>
 <section className="content"><header><div><small>Личный кабинет</small><h1>Добро пожаловать</h1></div><div className="avatar">PH</div></header>
 <div className="welcomePanel"><h2>Корпоративное обучение</h2><p>Продолжайте назначенные программы с последнего сохранённого этапа.</p><a className="primaryButton" href="/my-courses">Перейти к моим программам →</a></div>
 </section></main>
}

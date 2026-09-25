export default function Login(){
 return <main className="center"><form className="card">
  <div className="brand">PHANTOM</div><h1>Вход</h1><p>Используйте корпоративную учётную запись.</p>
  <label>E-mail<input type="email" placeholder="user@company.ru"/></label>
  <label>Пароль<input type="password" placeholder="••••••••"/></label>
  <button type="submit">Войти</button>
 </form></main>
}
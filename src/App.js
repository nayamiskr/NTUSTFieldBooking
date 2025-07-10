import { useEffect, useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

function App() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase.from('User').select('*');
      if (error) {
        console.error('錯誤：', error);
      } else {
        setAccounts(data);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <div className="App">
      <Navbar />
      <h1>帳號列表</h1>
      {accounts.map((item) => (
        <div key={item.UserId}>
          <p>帳號編號：{item.UserNo}</p>
          <p>建立時間：{new Date(item.created_at).toLocaleString()}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2>NTUST 場地預約系統</h2>
      </div>
      <ul className="navbar-center">
        <li><a href="#">場地</a></li>
        <li><a href="#">公告</a></li>
        <li><a href="#">我的預約</a></li>
      </ul>
      <div className="navbar-right">
        <div className="toggle-container">
          <label htmlFor="toggle" className="toggle-label" />
        </div>
      </div>
    </nav>
  );
}

export default App;

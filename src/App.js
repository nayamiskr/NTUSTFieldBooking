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

export default App;

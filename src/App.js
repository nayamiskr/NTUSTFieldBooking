import './App.css';
import Homepage from './page/homepage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Bookingpage from './page/bookingpage'; // 如果你有這個檔案可以先加上
import LoginPage from './page/loginPage';
import PayPage from './page/payPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home/:fieldType/:token" element={<Homepage />} />
          <Route path="/:name/:isSchool/field_img/:pict" element={<Bookingpage />} /> 
          <Route path='/pay' element={<PayPage/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
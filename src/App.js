import './App.css';
import Homepage from './page/homepage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Bookingpage from './page/bookingpage'; // 如果你有這個檔案可以先加上
import LoginPage from './page/loginPage';
import PayPage from './page/payPage';
import OrderPage from './page/orderPage';
import RegistPage from './page/registPage';
import ScrollToTop from './components/scrollToTop';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegistPage />} />
          <Route path="/home/:fieldType" element={<Homepage />} />
          <Route path="/:name/:isSchool/" element={<Bookingpage />} /> 
          <Route path='/pay' element={<PayPage/>}/>
          <Route path='/order' element={<OrderPage/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
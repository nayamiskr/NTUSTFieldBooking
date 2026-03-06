import { Routes, Route } from 'react-router-dom';
import Homepage from '../internal/page/homepage';
import Bookingpage from '../internal/page/bookingpage';
import PayPage from '../internal/page/payPage';
import OrderPage from '../internal/page/orderPage';

function NTUSTApp() {
  return (
    <Routes>
      <Route path="/home/" element={<Homepage />} />
      <Route path="/:name" element={<Bookingpage />} />
      <Route path='/pay' element={<PayPage />} />
      <Route path='/order' element={<OrderPage />} />
    </Routes>
  );
}

export default NTUSTApp;
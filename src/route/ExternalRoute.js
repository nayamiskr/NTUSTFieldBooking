import { Routes, Route } from 'react-router-dom';
import Homepage from '../external/page/homepage';
import Bookingpage from '../external//page/bookingpage';
import PayPage from '../external/page/payPage';
import OrderPage from '../external/page/orderPage';
import { GroupPage } from '../external/page/groupPage';

function OutsideApp() {
  return (
    <Routes>
      <Route path="/home/:fieldType" element={<Homepage />} />
      <Route path="/:id/" element={<Bookingpage />} />
      <Route path="/group" element={<GroupPage />} />
      <Route path='/pay' element={<PayPage />} />
      <Route path='/order' element={<OrderPage />} />
    </Routes>
  );
}

export default OutsideApp;
import { Routes, Route } from 'react-router-dom';
import VenuePage from '../external/page/VenuePage';
import BookingPage from '../external/page/BookingPage';
import PayPage from '../external/page/PayPage';
import OrderPage from '../external/page/OrderPage';
import PickUpPage from '../external/page/PickUpPage';
import { AnnouncePage } from '../external/page/AnnouncePage';
import { UserPage } from '../external/page/UserPage';
import HostApplyPage from "../external/page/HostApplyPage";

function OutsideApp() {
  return (
    <Routes>
      <Route path="/home/:fieldType" element={<VenuePage />} />
      <Route path="/:id/" element={<BookingPage />} />
      <Route path="/group" element={<PickUpPage />} />
      <Route path='/pay' element={<PayPage />} />
      <Route path='/order' element={<OrderPage />} />
      <Route path='/announce' element={<AnnouncePage />} />
      <Route path="/apply-host" element={<HostApplyPage />} />
      <Route path='/user' element={<UserPage />} />
    </Routes>
  );
}

export default OutsideApp;
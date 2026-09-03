import { Routes, Route } from 'react-router-dom';
import Homepage from '../external/page/Homepage';
import BookingPage from '../external/page/BookingPage';
import PayPage from '../external/page/PayPage';
import OrderPage from '../external/page/OrderPage';
import { GroupPage } from '../external/page/GroupPage';
import { AnnouncePage } from '../external/page/AnnouncePage';
import { UserPage } from '../external/page/UserPage';
import HostApplyPage from "../external/page/HostApplyPage";

function OutsideApp() {
  return (
    <Routes>
      <Route path="/home/:fieldType" element={<Homepage />} />
      <Route path="/:id/" element={<BookingPage />} />
      <Route path="/group" element={<GroupPage />} />
      <Route path='/pay' element={<PayPage />} />
      <Route path='/order' element={<OrderPage />} />
      <Route path='/announce' element={<AnnouncePage />} />
      <Route path="/apply-host" element={<HostApplyPage />} />
      <Route path='/user' element={<UserPage />} />
    </Routes>
  );
}

export default OutsideApp;
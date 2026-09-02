import { Routes, Route } from 'react-router-dom';
import Homepage from '../external/page/homepage';
import Bookingpage from '../external//page/bookingpage';
import PayPage from '../external/page/payPage';
import OrderPage from '../external/page/orderPage';
import { GroupPage } from '../external/page/groupPage';
import { AnnouncePage } from '../external/page/announcePage';
import { UserPage } from '../external/page/userPage';
import HostApplyPage from "../external/page/hostApplyPage";

function OutsideApp() {
  return (
    <Routes>
      <Route path="/home/:fieldType" element={<Homepage />} />
      <Route path="/:id/" element={<Bookingpage />} />
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
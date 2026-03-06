import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './page/loginPage';
import RegistPage from './page/registPage';
import ScrollToTop from './page/scrollToTop';
import NTUSTApp from './route/InternalRoute';
import OutsideApp from './route/ExternalRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegistPage />} />
          <Route path="/ntust/*" element={<NTUSTApp />} />
          <Route path="/external/*" element={<OutsideApp />} />

          <Route path="*" element={<div>沒有這東西</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
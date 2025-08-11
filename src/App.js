import './App.css';
import Homepage from './page/homepage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Bookingpage from './page/bookingpage'; // 如果你有這個檔案可以先加上

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/:name/:isSchool//field_img/:pict" element={<Bookingpage />} /> 
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
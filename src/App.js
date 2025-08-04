import './App.css';
import Homepage from './page/homepage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FieldDetail from './page/bookingpage'; // 如果你有這個檔案可以先加上

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/field/:name" element={<FieldDetail />} /> {/* 可選 */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
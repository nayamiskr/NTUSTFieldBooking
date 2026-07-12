import { GiHamburgerMenu } from "react-icons/gi";
import { IoPersonCircle } from "react-icons/io5";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import './navbar.css';

function Navbar() {
  const { fieldType } = useParams(); // 自動從當前網址抓出是羽球還是籃球 (例如 badminton)
  const setLogout = useAuthStore((state) => state.setLogout);
  const navigate = useNavigate();

  // 安全登出流程
  const handleLogout = (e) => {
    e.preventDefault(); // 阻止 <a> 標籤預設的跳頁重整
    setLogout(); // 清空 Zustand 記憶體裡的 Token 與資料
    navigate("/"); // 用 SPA 的方式無感導回登入頁
  };

  // 確保沒抓到 fieldType 時有個預設值 (看你們預設是啥，假設是 badminton)
  const currentType = fieldType || "badminton";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2>NTUST 場地預約系統</h2>
      </div>
      
      {/* 中央選單：全部換成 <Link to="..."> */}
      <ul className="navbar-center">
        <li><Link to={`/external/home/${currentType}`}>場地</Link></li>
        <li><Link to="/external/group">臨打</Link></li>
        <li><Link to="/external/announce">公告</Link></li>
        <li><Link to="/external/order">我的預約</Link></li>
      </ul>
      
      <div className="navbar-right dropdown">
        <div className="icon-container">
          <GiHamburgerMenu className="menu-icon" />
          <IoPersonCircle className="person-icon" />
        </div>
        
        {/* RWD 側邊/下拉選單：一樣全部換成 <Link>，並修復原本 <li> 標籤寫錯的語法 */}
        <div className="dropdown-content">
          <Link to={`/external/home/${currentType}`}>場地</Link>
          <Link to="/external/group">臨打</Link>
          <Link to="/external/announce">公告</Link>
          <Link to="/external/order">我的預約</Link>
          <Link to="#">個人資料</Link>
          <a href="/" onClick={handleLogout}>登出</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
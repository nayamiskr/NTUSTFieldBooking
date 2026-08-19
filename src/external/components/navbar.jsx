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
    e.preventDefault(); 
    setLogout(); 
    window.location.href = "/";

  };

  const currentType = fieldType || "badminton";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2>打球租與揪系統</h2>
      </div>
      
      {/* central menu */}
      <ul className="navbar-center">
        <li><Link to="/external/group">臨打</Link></li>
        <li><Link to={`/external/home/${currentType}`}>場地</Link></li>
        <li><Link to="/external/announce">公告</Link></li>
        <li><Link to="/external/order">我的預約</Link></li>
      </ul>
      
      <div className="navbar-right dropdown">
        <div className="icon-container">
          <GiHamburgerMenu className="menu-icon" />
          <IoPersonCircle className="person-icon" />
        </div>
        
        {/* dropdown content */}
        <div className="dropdown-content">
          <Link to="/external/group">臨打</Link>
          <Link to={`/external/home/${currentType}`}>場地</Link>
          <Link to="/external/announce">公告</Link>
          <Link to="/external/order">我的預約</Link>
          <Link to="/external/user">個人資料</Link>
          <a href="/" onClick={handleLogout}>登出</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
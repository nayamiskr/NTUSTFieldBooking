import { GiHamburgerMenu } from "react-icons/gi";
import { IoPersonCircle } from "react-icons/io5";
import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { getUserProfile } from "../../service/userService";
import './navbar.css';

function Navbar() {
  const { fieldType } = useParams(); // 自動從當前網址抓出是羽球還是籃球 (例如 badminton)
  const setLogout = useAuthStore((state) => state.setLogout);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    getUserProfile()
      .then((profile) => {
        if (isMounted) setUser(profile);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const closeMenuWhenClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", closeMenuWhenClickOutside);
    return () => document.removeEventListener("mousedown", closeMenuWhenClickOutside);
  }, []);

  // 安全登出流程
  const handleLogout = (e) => {
    e.preventDefault(); 
    setIsMenuOpen(false);
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
      
      <div ref={dropdownRef} className={`navbar-right dropdown ${isMenuOpen ? "is-open" : ""}`}>
        <button
          type="button"
          className="icon-container"
          aria-label="開啟使用者選單"
          aria-expanded={isMenuOpen}
          aria-controls="user-menu"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          <GiHamburgerMenu className="menu-icon" />
          <span className="nav-avatar">
            <IoPersonCircle className="person-icon" />
            {(user?.avatar_thumbnail || user?.avatar) && (
              <img
                src={user.avatar_thumbnail || user.avatar}
                alt="使用者頭像"
                onError={(event) => { event.currentTarget.style.display = "none"; }}
              />
            )}
          </span>
        </button>
        
        {/* dropdown content */}
        <div id="user-menu" className="dropdown-content">
          <div className="dropdown-profile">
            <span className="dropdown-avatar">
              <IoPersonCircle />
              {user?.avatar && <img src={user.avatar_thumbnail || user.avatar} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
            </span>
            <div>
              <p>{user?.display_name || "使用者"}</p>
              {user?.username && <span className="dropdown-username">@{user.username}</span>}
            </div>
          </div>
          <div className="dropdown-links">
            <Link onClick={() => setIsMenuOpen(false)} to="/external/group">臨打</Link>
            <Link onClick={() => setIsMenuOpen(false)} to={`/external/home/${currentType}`}>場地</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/external/announce">公告</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/external/order">我的預約</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/external/user">個人資料</Link>
          </div>
          <a className="logout-link" href="/" onClick={handleLogout}>登出</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

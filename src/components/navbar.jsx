import { GiHamburgerMenu } from "react-icons/gi";
import { IoPersonCircle } from "react-icons/io5";
import './navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2>NTUST 場地預約系統</h2>
      </div>
      <ul className="navbar-center">
        <li><a href="#">場地</a></li>
        <li><a href="#">公告</a></li>
        <li><a href="#">我的預約</a></li>
      </ul>
      <div className="navbar-right">
        <GiHamburgerMenu className="hamburger-icon" />
        <IoPersonCircle className="person-icon" />
      </div>
    </nav>
  );
}

export default Navbar;
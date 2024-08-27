import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import image from '../images/icon4.png';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType'); // Also remove userType on logout
    navigate("/login");
  };

  const userType = localStorage.getItem("userType");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.pathname === location.pathname) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }, [location]);

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLinkClick = () => {
    setIsCollapsed(true);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light">
        <Link className="navbar-brand mx-3 fw-bold fst-italic fs-2" to="/">
          <img src={image} alt="" width={"200px"}  />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
          onClick={toggleNavbar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse justify-content-end me-5 ${isCollapsed ? '' : 'show'}`} id="navbarNav">
          {!token ? (
            <ul className="navbar-nav gap-4">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={handleLinkClick}>Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/signup" onClick={handleLinkClick}>Signup</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login" onClick={handleLinkClick}>Login</Link>
              </li>
            </ul>
          ) : userType === "teacher" ? (
            <ul className="navbar-nav gap-4">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={handleLinkClick}>Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/teacher" onClick={handleLinkClick}>Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/createtest" onClick={handleLinkClick}>Create Test</Link>
              </li>
              <li className="nav-item">
                <button onClick={() => { handleLogout(); handleLinkClick(); }} className="btn bg-dark text-white logout-button">Logout</button>
              </li>
            </ul>
          ) : (
            <ul className="navbar-nav gap-4">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={handleLinkClick}>Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/enterCode" onClick={handleLinkClick}>Enter Test</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/mytests" onClick={handleLinkClick}>My Tests</Link>
              </li>
              <li className="nav-item">
                <button onClick={() => { handleLogout(); handleLinkClick(); }} className="btn bg-dark text-white logout-button">Logout</button>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;

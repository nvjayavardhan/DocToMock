import React from 'react';
import { Link } from 'react-router-dom';
import image from '../images/bgimg.jpg';

function Intro() {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Image at the top for screens below 1180x825 */}
        <div className="col-12 p-0 d-md-none">
          <img src={image} className="img-fluid" alt="Slide 1" />
        </div>
        {/* Half side with image */}
        <div className="col-md-6 p-0 order-md-0 order-1 d-none d-md-block">
          <img src={image} className="img-fluid" alt="Slide 1" />
        </div>
        {/* Rest for text */}
        <div className="col-md-6 d-flex align-items-center order-md-1 order-0">
          <div className="px-4 py-3">
            <p className="lead" style={{ fontSize: "40px", fontFamily: "Jost, sans-serif", fontWeight: "600" }}>
              Hassle-free conversion from any <span style={{ color: "#014495" }}>PDF to MOCK</span> quiz
            </p>
            {localStorage.getItem("token") ? (
              localStorage.getItem("userType") === "student" ? (
                <Link to="/enterCode" className="btn btn-lg text-white" style={{ backgroundColor: "#014495" }}>
                  Enter Test
                </Link>
              ) : (
                <Link to="/createtest">
                  <button className="button1 ">
                    Create Test
                    <svg fill="currentColor" viewBox="0 0 24 24" className="icon">
                      <path
                        clipRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </button>
                </Link>
              )
            ) : (
              <Link to="/signup" className="btn btn-lg text-white" style={{ backgroundColor: "#014495" }}>
                Register Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Intro;

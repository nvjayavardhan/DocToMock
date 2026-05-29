import React from 'react';
import { Container, Col, Nav, Navbar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <Navbar style={{ backgroundColor: "white" }} variant="dark" fixed="bottom">
      <Container className="d-flex justify-content-between p-2">
        <Col xs="auto" md="auto" className="d-flex align-items-center">
          <Nav.Link href="/">
            <span className="ms-4 h5 mb-0 fst-italic font-weight-bold" style={{ color: "#014495" }}>Doc2Mock</span>
          </Nav.Link>
        </Col>
        <Col xs="auto" md="auto" className="d-none d-lg-flex align-items-center">
          <span className="text-center fw-bold" style={{ color: "#014495" }}>
            Doc2Mock, 2024. All rights reserved.
          </span>
        </Col>

        <Col xs="auto" md="auto" className="d-flex align-items-center">
          <div>
            <button type="button" aria-label="Twitter" className="p-2" style={{ border: 0, background: 'transparent' }}>
              <FontAwesomeIcon icon={faTwitter} style={{ color: "#014495" }} className="footer-social-icon" />
            </button>
            <button type="button" aria-label="Facebook" className="mx-3 p-2" style={{ border: 0, background: 'transparent' }}>
              <FontAwesomeIcon icon={faFacebook} style={{ color: "#014495" }} className="footer-social-icon" />
            </button>
            <button type="button" aria-label="Instagram" className="p-2" style={{ border: 0, background: 'transparent' }}>
              <FontAwesomeIcon icon={faInstagram} style={{ color: "#014495" }} className="footer-social-icon" />
            </button>
          </div>
        </Col>

      </Container>
    </Navbar>
  );
};

export default Footer;

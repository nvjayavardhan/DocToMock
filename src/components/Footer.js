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
            <a href="#" className="p-2">
              <FontAwesomeIcon icon={faTwitter} style={{ color: "#014495" }} className="footer-social-icon" />
            </a>
            <a href="#" className="mx-3 p-2">
              <FontAwesomeIcon icon={faFacebook} style={{ color: "#014495" }} className="footer-social-icon" />
            </a>
            <a href="#" className="p-2">
              <FontAwesomeIcon icon={faInstagram} style={{ color: "#014495" }} className="footer-social-icon" />
            </a>
          </div>
        </Col>

      </Container>
    </Navbar>
  );
};

export default Footer;
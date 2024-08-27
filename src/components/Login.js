import React, { useState, useEffect } from 'react';
import { Container, Col, Row, Button, Form as BootstrapForm, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Snackbar, Alert } from '@mui/material';
import image from '../images/icon3.jpg';

function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState({ email: false, password: false });
  const [errorMessage, setErrorMessage] = useState({ email: "", password: "" });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const storedToken = localStorage.getItem('token');
    if (storedEmail && storedToken) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (credentials.email === "" || credentials.password === "") {
      setAlertMessage("Please fill in both email and password fields.");
      setAlertOpen(true);
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const json = await response.json();
      console.log("Login response:", json);

      if (json.success) {
        localStorage.setItem('userEmail', credentials.email);
        localStorage.setItem('token', json.authToken);
        localStorage.setItem("userType", json.userType);
        navigate("/");
      } else {
        if (!json.emailValid) {
          setAlertMessage("Invalid credentials.");
          setAlertOpen(true);
        }
        if (!json.passwordValid) {
          setError({
            ...error,
            password: true
          });
          setErrorMessage({
            ...errorMessage,
            password: "Invalid password"
          });
        }
      }
    } catch (error) {
      console.error("Error occurred:", error);
      setAlertMessage("An error occurred. Please try again later.");
      setAlertOpen(true);
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: false });
    setErrorMessage({ ...errorMessage, [e.target.name]: "" });
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      <Row className="w-100">
        <Col xs={12} md={6} className="d-none d-md-flex justify-content-center align-items-center">
          <Image src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" fluid alt="Phone image" />
        </Col>
        <Col xs={12} md={6} className="d-flex flex-column justify-content-center align-items-center" style={{ marginTop: '-70px' }}>
          <img src={image} className="img-fluid" alt="" />
          <BootstrapForm onSubmit={handleSubmit} className="w-75 " style={{marginTop:"-30px"}}>
            <BootstrapForm.Group className="mb-4">
              <TextField 
                label="Email address"
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                error={error.email}
                helperText={error.email ? errorMessage.email : ""}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </BootstrapForm.Group>
            <BootstrapForm.Group className="mb-4">
              <TextField 
                label="Password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                error={error.password}
                helperText={error.password ? errorMessage.password : ""}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </BootstrapForm.Group>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <BootstrapForm.Check type="checkbox" id="flexCheckDefault" label="Remember me" />
              <Link to="/signup" style={{ color: "#014495" }}>New User?</Link>
            </div>
            <Button 
              type="submit" 
              className="mb-4 lg-btn" 
              style={{ backgroundColor: "white",color:'#014495', width: '100%' }} 
              size="lg"
            >
              Log in
            </Button>
          </BootstrapForm>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;

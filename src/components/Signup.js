import React, { useState, useEffect } from 'react';
import * as Components from './Component.js';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Snackbar, Alert } from '@mui/material';

function Signup() {
  const navigate = useNavigate();
  const [signIn, toggle] = useState(true); // Track signup/signin state
  const [credentials, setCredentials] = useState({ name: "", email: "", password: "", organizationName: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "", organizationName: "" });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");

  const validateInputs = () => {
    const newErrors = {};
    if (!credentials.name.match(/^[a-zA-Z0-9]+$/)) {
      newErrors.name = "Username should not contain special characters";
    }
    if (credentials.name.length < 3) {
      newErrors.name = "Username should be at least 3 characters long";
    }
    if (credentials.password.length < 6) {
      newErrors.password = "Password should be at least 6 characters long";
    }
    if (!credentials.email.includes("@")) {
      newErrors.email = "Enter a valid email";
    }
    setErrors(newErrors);
    console.log(Object.keys(newErrors).length)
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitTeacher = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      setAlertMessage("Please fix the errors in the form.");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }
    if (!credentials.name || !credentials.email || !credentials.password || !credentials.organizationName) {
      setAlertMessage("Please fill in all fields.");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }

    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');
    if (userEmail && token) {
      localStorage.setItem("userType", "teacher");
      navigate("/");
      return;
    }
    const response = await fetch("http://localhost:5000/api/auth/newTeacher", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: credentials.name, email: credentials.email, password: credentials.password, organizationName: credentials.organizationName })
    });

    const json = await response.json();
    console.log(json);

    if (json.success) {
      setAlertMessage("Account created successfully!");
      setAlertType("success");
      setAlertOpen(true);
      navigate("/login");
    } else {
      const newErrors = {};
      if (json.error.includes('email')) newErrors.email = "User already exists";
      if (json.error.includes('name')) newErrors.name = "User already exists";
      setAlertMessage("User already exists.");
      setAlertOpen(true);
      setErrors(newErrors);
    }
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      setAlertMessage("Please fix the errors in the form.");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }
    if (!credentials.name || !credentials.email || !credentials.password) {
      setAlertMessage("Please fill in all fields.");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }

    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');
    if (userEmail && token) {
      localStorage.setItem("userType", "student");
      navigate("/");
      return;
    }
    const response = await fetch("http://localhost:5000/api/auth/newStudent", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: credentials.name, email: credentials.email, password: credentials.password })
    });

    const json = await response.json();
    console.log(json);

    if (json.success) {
      setAlertMessage("Account created successfully!");
      setAlertType("success");
      setAlertOpen(true);
      navigate("/login");
    } else {
      const newErrors = {};
      if (json.error.includes('email')) newErrors.email = "User already exists";
      if (json.error.includes('name')) newErrors.name = "User already exists";
      setAlertMessage("User already exists.");
      setAlertOpen(true);
      setErrors(newErrors);
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const storedToken = localStorage.getItem('token');
    if (storedEmail && storedToken) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error when user starts typing
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };

  const handleToggle = (isSignIn) => {
    toggle(isSignIn);
    setCredentials({ name: "", email: "", password: "", organizationName: "" });
    setErrors({ name: "", email: "", password: "", organizationName: "" });
  };

  return (
    <div className='body1' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', overflow: 'hidden' }}>
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alertType} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <Components.Container style={{ padding: "0px", width: "900px", height: "600px", borderRadius: "15px", boxShadow: "0 0 20px rgba(0,0,0,0.1)" }}>
        <Components.SignUpContainer signinIn={signIn}>
          <Components.Form style={{display:"flex", flexDirection:"column"}} onSubmit={handleSubmitTeacher}>
            <Components.Title>Create Account</Components.Title>
            <TextField
              label="Name"
              name="name"
              value={credentials.name}
              onChange={handleChange}
              // error={!!errors.name}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',}
                // },
                // '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
                //   borderColor: 'red',
                // },
              }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              error={!!errors.email}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
                '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'red',
                },
              }}
            />
            <TextField
              label="Organization Name"
              name="organizationName"
              value={credentials.organizationName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
                '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'red',
                },
              }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
                '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'red',
                },
              }}
            />
            <Components.Button style={{ marginTop: "20px", backgroundColor:'white', color:'#014495' }}>SignUp as Teacher</Components.Button>
            <Link to="/login" style={{ marginTop: "10px", color: "#014495" }}>Existing User? Login</Link>
          </Components.Form>
        </Components.SignUpContainer>

        <Components.SignInContainer signinIn={signIn}>
          <Components.Form style={{display:"flex", flexDirection:"column", gap: '10px'}} onSubmit={handleSubmitStudent}>
            <Components.Title>Create Account</Components.Title>
            <TextField
              label="Roll No."
              name="name"
              value={credentials.name}
              onChange={handleChange}
              error={!!errors.name}
              // helperText={errors.name}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                },
                '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'red',
                },
              }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              error={!!errors.email}
              // helperText={errors.email}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
                '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'red',
                },
              }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
                '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'red',
                },
              }}
            />
            <Components.Button style={{ marginTop: "20px", backgroundColor:'white',color:'#014495', }}>SignUp as Student</Components.Button>
            <Link to="/login" style={{ marginTop: "10px", color: "#014495" }}>Existing User? Login</Link>
          </Components.Form>
        </Components.SignInContainer>

        <Components.OverlayContainer signinIn={signIn}>
          <Components.Overlay signinIn={signIn}>

            <Components.LeftOverlayPanel signinIn={signIn}>
              <Components.Title>Hello, Teacher!</Components.Title>
              <Components.Paragraph>
                To keep connected with us please login with your personal info and organization name
              </Components.Paragraph>
              <Components.GhostButton onClick={() => handleToggle(true)}>
                SignUp as Student
              </Components.GhostButton>
            </Components.LeftOverlayPanel>

            <Components.RightOverlayPanel signinIn={signIn}>
              <Components.Title>Hello, Student!</Components.Title>
              <Components.Paragraph>
                To keep connected with us please login with your personal info
              </Components.Paragraph>
              <Components.GhostButton onClick={() => handleToggle(false)}>
                SignUp as Teacher
              </Components.GhostButton>
            </Components.RightOverlayPanel>

          </Components.Overlay>
        </Components.OverlayContainer>

      </Components.Container>
    </div>
  )
}

export default Signup;

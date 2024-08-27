import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation
} from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import Layout from './components/Layout';
import './App.css';
import TeacherDash from './components/TeacherDash';
import MockTest from './components/MockTest';
import PdfReader from './components/PdfReader';
import CreateTest from './components/CreateTest';
import OCRComponent from './components/OCRComponent';
import WordReader from './components/WordReader';
import Keyword from './components/Keyword-1';
import TestFinal from './components/TestFinal';
import EnterCode from './components/EnterCode';
import MyTest from './components/MyTest';
import Analytics from './components/Analytics';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userType = localStorage.getItem("userType");
        setUserRole(userType);
      } catch (error) {
        console.error("Error decoding token:", error);
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, [location.pathname]); // Add location.pathname to the dependency array

  useEffect(() => {
    // Check if the route is accessible by the current user role
    function checkAccess(pathname) {
      const teacherRoutes = ['/teacher', '/createtest', '/keyword', '/testfinal', '/analytics', '/pdfreader', '/imagereader', '/wordreader'];
      const studentRoutes = ['/mocktest', '/enterCode', '/mytests'];

      if ((userRole === 'teacher' && studentRoutes.some(route => pathname.startsWith(route))) ||
          (userRole === 'student' && teacherRoutes.some(route => pathname.startsWith(route)))) {
        return false;
      }
      return true;
    }

    if (userRole && !checkAccess(location.pathname)) {
      navigate('/');  // Navigate to home if the route is not accessible
    }
  }, [userRole, location.pathname, navigate]);

  const publicRoutes = ['/', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const isAccessibleRoute = userRole && (userRole === 'teacher' && location.pathname.startsWith('/teacher') ||
                                          userRole === 'student' && location.pathname.startsWith('/mocktest'));

  if (userRole === null && !isPublicRoute && !isAccessibleRoute) {
    // Render nothing or a loading spinner while the user role is being loaded
    return <div>Loading....</div>;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
      </Route>
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} /> {/* Ensure signup route is always available */}
      {userRole === "teacher" && (
        <>
          <Route element={<Layout />}>
            <Route path='/teacher' element={<TeacherDash />} />
            <Route path='/createtest' element={<CreateTest />} />
            <Route path='/keyword' element={<Keyword />} />
            <Route path="/analytics/:uniqueCode" element={<Analytics />} />
            <Route path='/pdfreader' element={<PdfReader />} />
            <Route path='/imagereader' element={<OCRComponent />} />
            <Route path='/wordreader' element={<WordReader />} />
          </Route>
          <Route path='/testfinal' element={<TestFinal />} />
        </>
      )}
      {userRole === "student" && (
        <>
          <Route element={<Layout />}>
            <Route path="/enterCode" element={<EnterCode />} />
            <Route path='/mytests' element={<MyTest />} />
          </Route>
          <Route path="/mocktest/:uniqueCode" element={<MockTest />} />
        </>
      )}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;

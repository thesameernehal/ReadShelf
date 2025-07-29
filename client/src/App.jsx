import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Booklist from './pages/BookList';
import Addbook from './pages/Addbook';
import Navbar from './components/Navbar';
import EditBook from './pages/EditBook';
import Register from './pages/Register';
import Login from './pages/Login';
import About from './pages/About';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Router>
      <div className='text-2xl p-3'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/add' element={
            <ProtectedRoute>
              <Addbook />
            </ProtectedRoute>}></Route>
          <Route path='/books' element={
            <ProtectedRoute>
              <Booklist /></ProtectedRoute>} ></Route>
          <Route path='/edit/:id' element={<EditBook />}></Route>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/about' element={<About />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
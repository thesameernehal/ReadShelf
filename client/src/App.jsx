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
import Recommendations from './pages/Recommendations';
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
          <Route path='/recommendations' element={
            <ProtectedRoute>
              <Recommendations /></ProtectedRoute>} ></Route>
          <Route path='/edit/:id' element={<EditBook />}></Route>
          <Route path='/register' element={<Register />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/about' element={<About />}></Route>
        </Routes>
      </div>

      <footer className='bg-gray-900 text-gray-400 py-8 px-4 mt-16'>
        <div className='max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-sm'><span className='text-white font-semibold'>ReadShelf</span> - Track. Read. Repeat.</p>

          <p className='text-sm'>Built with ❤️ by {"Sameer Nehal"}
          </p>

          <p className='text-sm'>
            <a href="https://github.com/thesameernehal" target='_blank' rel="noopener noreferrer" className='text-indigo-400 hover:underline'>Sameer Nehal</a>
          </p>

          <p className='text-sm'>© 2025 ReadShelf. All rights reserved</p>
        </div>
      </footer>
    </Router>


  );
}

export default App; 
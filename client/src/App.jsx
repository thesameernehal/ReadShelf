import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Booklist from './pages/BookList';
import Addbook from './pages/Addbook';
import Navbar from './components/Navbar';
import EditBook from './pages/EditBook';

function App() {
  return (
    <Router>
      <div className='text-2xl p-3'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/add' element={<Addbook />}></Route>
          <Route path='/books' element={<Booklist />} ></Route>
          <Route path='/edit/:id' element={<EditBook />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
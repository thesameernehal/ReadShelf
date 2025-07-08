import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Booklist from './pages/Booklist';
import Addbook from './pages/Addbook';

function App() {
  return (
    <Router>
      <div className='text-2xl p-3'>
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/add' element={<Addbook />}></Route>
          <Route path='/books' element={<Booklist />} ></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
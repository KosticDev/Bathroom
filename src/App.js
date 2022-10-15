import UI from './UI';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Login';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path='/' element={<UI />} />
          <Route exact path='/login' element={<Login />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;

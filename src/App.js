import UI from './UI';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/Login';
import Admin from './components/Admin/Admin';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path='/' element={<UI />} />
          <Route exact path='/login' element={<Login />} />
          <Route exact path='/admin' element={<Admin />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;

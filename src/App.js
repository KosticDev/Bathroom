import UI from './UI';
import './App.css';
import { BrowserRouter as Routes, Route, Router } from 'react-router-dom'
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path='/' element={<UI />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;

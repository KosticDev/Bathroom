import "./index.css"
import { Link } from 'react-router-dom'

const Navbar = () => {
    return <div className='header'>
        <div className="d-flex justify-content-between p-2  h-100">
            <div className="logo">
                <img src="logo.png" height={'100%'} alt="" />
                <img src="logo1.png" height={'100%'} alt="" />
            </div>
            <div>
                <a href="login">Login/SingIn</a>
            </div>
        </div>
    </div>
}

export default Navbar;
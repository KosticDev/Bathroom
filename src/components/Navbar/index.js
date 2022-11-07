import { Link, useNavigate } from 'react-router-dom'
import { clearPositionData } from '../../utils/cacheData';
import "./index.css"

const Navbar = ( props ) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();
        localStorage.setItem("bathroom_login", false);
        localStorage.setItem("bathroom_isOwner", false);
        clearPositionData();
        navigate('/login');
        props.init();
    }
    return <div className='header'>
        <div className="d-flex justify-content-between p-2  h-100">
            <div className="logo">
                <img src="logo.png" height={'100%'} alt="" />
                <img src="logo1.png" height={'100%'} alt="" />
            </div>
            <div className="b_login">
                { localStorage.getItem("bathroom_login") === "true" ? <button style={{borderColor: "white"}} onClick={(e) => handleClick(e)}>Logout</button> : <Link to='login'>Login/Register</Link>}
            </div>
        </div>
    </div>
}

export default Navbar;
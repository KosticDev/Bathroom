import { Link, useNavigate } from "react-router-dom";
import { clearPositionData } from "../../utils/cacheData";
import "./index.css";

const Navbar = (props) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    localStorage.setItem("bathroom_login", false);
    localStorage.setItem("bathroom_isOwner", false);
    localStorage.setItem('new_plan', false);
    clearPositionData();
    navigate("/login");
    props.init();
  };
  return (
    <div className="header">
      <div className="d-flex justify-content-between p-2  h-100">
        <div className="logo flex flex-row">
          <img
            src="logo.png"
            className="h-[45px] cursor-pointer mr-0 logoImg"
            alt=""
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/";
            }}
          />
          <img
            src="logo1.png"
            className="h-[45px] cursor-pointer"
            alt=""
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/";
            }}
          />
        </div>
        <div className="b_login">
          {localStorage.getItem("bathroom_login") === "true" ? (
            <button
              style={{ borderColor: "white" }}
              onClick={(e) => handleClick(e)}
              className="logoutBtn mr-2 font-bold"
            >
              Logout
            </button>
          ) : (
            <Link to="/login"><p className="font-bold">Login/Register</p></Link>
          )}
        </div>
      </div>
      <div className="border-[1px] h-[1px] border-gray-400 z-[9999]" />
    </div>
  );
};

export default Navbar;

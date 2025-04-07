import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import Logo from "../Exprivia320.png";

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link to="/">
                        <img className="ms-5" src={Logo} style={{ width: '150px', height: '45px' }} alt="Logo"></img>
                    </Link>
                </li>
                <li className="mt-2 ms-5"><Link to="/">Home</Link></li>
                <li className="mt-2"><Link to="/allocazioni">Allocazioni</Link></li>
                <li className="mt-2"><Link to="/progetti">Progetti</Link></li>
                <li className="mt-2"><Link to="/personale">Personale</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;

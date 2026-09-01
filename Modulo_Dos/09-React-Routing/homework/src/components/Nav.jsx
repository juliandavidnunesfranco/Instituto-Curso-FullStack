import React from 'react';
import Logo from '../img/logo.png'
import SearchBar from './SearchBar.jsx';
import './Nav.css';


function Nav({onSearch}) {
  return (
    <nav className="navbar navbar-dark bg-dark">
        <span className="navbar-brand">
          <img id="logo" src={Logo} width="30" height="30" className="d-inline-block align-top" alt="" />
          Weather App
        </span>
        <SearchBar
          onSearch={onSearch}
        />
    </nav>
  );
};

export default Nav;

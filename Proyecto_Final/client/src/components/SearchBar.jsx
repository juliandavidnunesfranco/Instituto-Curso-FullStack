import React from 'react';
import { useState } from "react";
import { useDispatch } from "react-redux";
//import { Link } from "react-router-dom";
import { clearVideogameDetail, getByNameVideogame } from "../actions";
import './SearchBar.css';


const SearchBar = () => {
  const dispatch = useDispatch();    
  const [name, setName] = useState('');      //estado name

    const handleInputChange = (e) =>{     //onChange={e => setName(e.target.value)} dentro del html
        e.preventDefault()
        setName(e.target.value)       //setea el estado por el escrito en barra    
        //console.log(name)           
    }

    const handleSubmit = (e) =>{            //onSubmit={}
        e.preventDefault()
        dispatch(clearVideogameDetail(dispatch))  //evaluar
        dispatch(getByNameVideogame(name))   //cuando da enter despacha la function que lo busca
        setName("");
    }
    
    return (
        <div className="search">            
            <input type="text" 
            placeholder="Buscar..."
            onChange={(e) => handleInputChange(e)}
            />
            <button className="btn" 
            type="submit" 
            onClick={(e) => handleSubmit(e)}
            >Buscar</button>            
        </div>
    )
}

export default SearchBar
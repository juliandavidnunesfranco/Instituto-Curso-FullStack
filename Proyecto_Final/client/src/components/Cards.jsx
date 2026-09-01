import React from 'react';
import { NavLink } from 'react-router-dom';
import videogame from '../assets/videogame.png';
import {getVideogameDetail} from '../actions'
import './Cards.css';

const Cards = ({id, name, image, genres, createdInDB, rating}) => {
  //console.log(id);

  return (
    <div className='Card  center'>
        <NavLink className='all width-100' onClick={(e)=>getVideogameDetail(id)}   to={`/videogames/${id}`}>
          <img
            className='img'
            src={/(https?:\/\/.*\.(?:png|jpg))/i.test(image) ? image : videogame }  //imagen proyecto
            alt='img not found'
            width='200px'
            height='180px'
          />
          <div className='Card3'>
            <h2>{name}</h2>          
            <h3>{rating}</h3>
            <h3>Genres:</h3>
          </div>         
            {!createdInDB? (      //evalua la api
              <div className='Card4'>
                
                {genres?.map((e, t)=>{
                  return(
                    <div key={`${t}`}>   
                      <p>{e}</p>
                    </div>              
                  )
                })}
              </div>
               ): (         // si fue creado en DB
              <div className='Card5'>
               {genres?.map((e, t)=>{
                  return (
                    <div className='Card6' key={t}>
                      <p>{e.name}</p>
                    </div>
                  )
                })}
              </div>
            )}
        </NavLink>
    </div>
      

  )
}

export default Cards;



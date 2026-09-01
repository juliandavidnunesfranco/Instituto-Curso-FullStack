import React from 'react';
import  './Pagination.css'

const Pagination = ({ videogamesPerPage, allVideogames, pagination }) => {
    const numeroPag = [];
    for (let i = 1; i <= Math.ceil(allVideogames / videogamesPerPage); i++) {
      numeroPag.push(i);
    }
  
    return (
      <div>
        <ul className='list'>
          <p className='pn'>
            <b>Pages number:</b>
          </p>
          {numeroPag?.map((number) => (
            <li className='items' key={number}>
              <button className='a'  onClick={(event) => pagination(event, number)}>
                {number}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
export default Pagination;
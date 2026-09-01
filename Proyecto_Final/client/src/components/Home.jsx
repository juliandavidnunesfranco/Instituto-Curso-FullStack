import React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  filterGamesByGender,
  filterCreated,
  orderByName,
  orderByRating,
  getVideogames,
  clearVideogameDetail,
  clearGenreDetail,
  getGenres,
} from "../actions";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import Cards from "./Cards";
import "./Home.css";

const Home = (props) => {
  const dispatch = useDispatch();
  const allVideogames = useSelector((state) => state.videogames);
  //console.log(allVideogames);  estado-->>reducer

  //-------->>>>>Boton de Navegacion
  const { history } = props; //propiedad del dom

  //-------->>>>>Paginado

  const [currentPage, setCurrentPage] = useState(1); // estado donde cada pag una sola
  const [videogamesPerPage, setVideogamesPerPage] = useState(15); //estado cantidad de videogames por pag

  let ultimoGamePage = currentPage * videogamesPerPage; //
  let primerGamePage = ultimoGamePage - videogamesPerPage; //

  let currentVideoItems = allVideogames?.slice(primerGamePage, ultimoGamePage);

  let pages = [];

  const countPages = Math.ceil(allVideogames.length / videogamesPerPage);

  for (let i = 1; i < countPages.length; i++) {
    pages.push(i);
  }

  const paginado = (e, page) => {
    e.preventDefault();
    setCurrentPage(page);
  };

  //------->>>>>>Cargo los videogames con useEffect

  useEffect(() => {
    dispatch(getVideogames());
  }, [dispatch]);

  //-------->>>>Handlers

  const handleClick = (e) => {
    // se declara como variable para usarla mas adelante  en el renderizado
    e.preventDefault();
    dispatch(clearVideogameDetail(dispatch));
    dispatch(getVideogames());
  };

  const handleGenres = (e) => {
    e.preventDefault();
    /* dispatch(clearVideogameDetail(dispatch)); */
    dispatch(getGenres());
  };

  const handleFilterByGenre = (e) => {
    dispatch(clearGenreDetail(dispatch));
    dispatch(filterGamesByGender(e.target.value));
  };

  const handleFilterCreated = (e) => {
    e.preventDefault();
    dispatch(filterCreated(e.target.value));
  };

  const [orden, setOrden] = useState("");

  const handleSortAlfabetica = (e) => {
    e.preventDefault();
    dispatch(orderByName(e.target.value));
    setCurrentPage(1); //seteo la pagina principal
    setOrden(`Ordenado ${e.target.value}`);
  };

  const handleSortRating = (e) => {
    e.preventDefault();
    dispatch(orderByRating(e.target.value));
    setCurrentPage(1); //seteo la pagina principal
    setOrden(`Ordenado ${e.target.value}`);
  };

  return (
    <React.Fragment>
      <nav>
        <button className="button" onClick={handleClick}>
          Cargar videogames
        </button>
        <button className="button-genre" onClick={handleGenres}>
          Cargar Generos
        </button>
        <div className="cuadroUno">
          <h3>Orden Alfabetico</h3>
          <select className="selects" onChange={(e) => handleSortAlfabetica(e)}>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
        <div className="cuadroDos">
          <h3>Ordenar Rating</h3>
          <select className="selects" onChange={(e) => handleSortRating(e)}>
            <option value="ratasc">Ascendente</option>
            <option value="ratdesc">Descendente</option>
          </select>
        </div>
        <div className="cuadroTres">
          <h3>Ordenar Generos</h3>
          <select className="selects" onChange={(e) => handleFilterByGenre(e)}>
            <option value="All">All Genres</option>
            <option value="Action">Action</option>
            <option value="RPG">RPG</option>
            <option value="Adventure">Adventure</option>
            <option value="Indie">Indie</option>
            <option value="Strategy">Strategy</option>
            <option value="Shooter">Shooter</option>
            <option value="Casual">Casual</option>
            <option value="Simulation">Simulation</option>
            <option value="Puzzle">Puzzle</option>
            <option value="Arcade">Arcade</option>
            <option value="Platformer">Platformer</option>
            <option value="Racing">Racing</option>
            <option value="Multiplayer">Massively Multiplayer</option>
            <option value="Sports">Sports</option>
            <option value="Fighting">Fighting</option>
            <option value="Family">Family</option>
            <option value="Board">Board Games</option>
            <option value="Educational">Educational</option>
            <option value="Card">Card</option>
          </select>
        </div>
        <div className="cuadroCuatro">
          <h3>Seleccionar X</h3>
          <select className="selects" onChange={(e) => handleFilterCreated(e)}>
            <option value="All">Todos</option>
            <option value="api">From API</option>
            <option value="Created">From DB</option>
          </select>
        </div>
        <div>
          <Pagination
            videogamesPerPage={videogamesPerPage}
            allVideogames={allVideogames.length}
            pagination={paginado}
          />
        </div>
      </nav>
      <div>
        <SearchBar />
      </div>
      <button
        className="button-createv"
        onClick={() => history.push("/create")} //viene del dom propiedad como location, match y history
      >
        Crear videogame
      </button>
      {currentVideoItems?.map((e) => {
        //si el paginado cargo algo entonces
        return (
          //retorne un componente que tiene como propiedades
          <Cards //lo siguiente id, name, image ...
            id={e.id} //pero aun no lo rederiza solo esta capturando estas props del dom
            name={e.name}
            image={e.image}
            genres={e.genres}
            createdInDB={e.createdInDB}
            rating={e.rating}
            key={e.id}
          />
        );
      })}
    </React.Fragment>
  );
};

export default withRouter(Home);

import axios from "axios"; // Se instala y se importa

//las actions se declaran en string para traerlas en las functions//
export const GET_VIDEOGAMES = "GET_VIDEOGAMES";
export const GET_GENRES = "GET_GENRES";
export const GET_DETAILS = "GET_DETAILS";
export const CLEAR_DETAIL = "CLEAR_DETAIL";
export const FILTER_BY_GENDER = "FILTER_BY_GENDER";
export const FILTER_BY_CREATED = "FILTER_BY_CREATED";
export const ORDER_BY_NAME = "ORDER_BY_NAME";
export const GET_NAME_VIDEOGAME = "GET_NAME_VIDEOGAME";
export const POST_VIDEOGAME = "POST_VIDEOGAME";
export const ORDER_BY_RATING = "ORDER_BY_RATING";
export const CLEAR_DETAIL_GENRE = "CLEAR_DETAIL_GENRE";
export const CLEAN_VIDEOGAMES = "CLEAN_VIDEOGAMES";
export const GET_ALL_PLATFORMS = "GET_ALL_PLATFORMS";
//

/* const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getVideogames())
    dispatch(getGenres())
   },[dispatch]) 
*/

// getVideogames es una function que nos trae los videogames que declaramos en
// en el back cuando estemos en la ruta ...../videogames
//por lo que esta function esta haciendo es un llamando al back-end en la ruta .../videogames

export const getVideogames = () => {
  return async function (dispatch) {
    try {
      var json = await axios.get("http://localhost:3001/videogames");
      return dispatch({
        type: GET_VIDEOGAMES,
        payload: json.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
};

//esta funcion tambien llama al back-end en la ruta .../genres donde se traen todos
export const getGenres = () => {
  return async (dispatch) => {
    try {
      let json = await axios.get("http://localhost:3001/genres");
      return dispatch({
        type: GET_GENRES,
        payload: json.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
};

//cuando se ejecute esta action se usa el metodo post en la ruta del back-end
export const postVideogame = (payload) => {
  ///payLoad hace referencia al cuerpo que se esta cargando
  return async (dispatch) => {
    ///en este caso es un videogame
    try {
      var createVideogame = await axios.post(
        "http://localhost:3001/videogames",
        payload
      );
      return dispatch({
        type: POST_VIDEOGAME,
        payload: createVideogame.data,
      });
    } catch (error) {
      alert("Videogame name already exist");
      console.log(error);
    }
  };
};

//con el metodo .then para manejo de promesas
//llamada al back-end cuando sea necesario traer por id en especial para ver los detalles del videogame
/* export const getVideogameDetail = (id) => {
    return (dispatch) => {
      axios
        .get(`http://localhost:3001/videogames/${id}`) // se hace el llamadao
        .then((json) => json.data)                     //se especifica que necesitamos 
        .then((data) => dispatch({                     // se despacha la info con el metodo dispatch
             type: GET_DETAILS,                        // se dice que la action que estamos despachando es una tipo GET_DETAILS
             payload: data }))                         // que esta action va cargada con un payload que es el data del id que solicitamos
        .catch((error) => console.log(error));         // con este modelo no usamos try catch  solo .then(...) y .catch(...)
    };
};  */

//con el metodo async await para manejo de promesas
export const getVideogameDetail = (id) => {
  return async (dispatch) => {
    try {
      const gameDetail = await axios.get(
        `http://localhost:3001/videogames/${id}`
      );
      return dispatch({ type: GET_DETAILS, payload: gameDetail.data });
    } catch (e) {
      console.log(e);
    }
  };
};

export const getByNameVideogame = (name) => {
  // aca remplazamos payload por name    lo que quiere decir que vamos a estar cargando es el name
  return async function (dispatch) {
    // la function despacha un llamado al back-end con el name donde lo pone por query
    try {
      // como es una promesa  usamos try-catch  and  async-await
      let json = await axios.get(
        `http://localhost:3001/videogames?name=${name}`
      );
      return dispatch({
        // recordar que return nos saca de la function en caso acertado
        type: GET_NAME_VIDEOGAME, //aca decimos que el tipo de action es un GET_NAME_VIDEOGAME
        payload: json.data, // y que necesitamos cargar el videogame solicitado por name
      });
    } catch (error) {
      alert("Videogame not found");
      window.location.href = "http://localhost:3000/home";
      console.log(error);
    }
  };
};

export const getAllPlatforms = () => {
  return async (dispatch) => {
    try {
      let json = await axios.get("http://localhost:3001/platforms");
      return dispatch({
        type: GET_ALL_PLATFORMS,
        payload: json.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
};

//el payload se setea a un arreglo vacio
export const clearVideogameDetail = (dispatch) => {
  return dispatch({
    type: CLEAR_DETAIL,
    payload: [],
  });
};

export const clearGenreDetail = (dispatch) => {
  return dispatch({
    type: CLEAR_DETAIL_GENRE,
    payload: [],
  });
};

export const cleanVideogames = (dispatch) => {
  return dispatch({
    type: CLEAN_VIDEOGAMES,
    payload: [],
  });
};

export function filterGamesByGender(payload) {
  // console.log(payload)
  return {
    type: FILTER_BY_GENDER,
    payload,
  };
}

export function filterCreated(payload) {
  //console.log(payload)
  return {
    type: FILTER_BY_CREATED,
    payload,
  };
}

export function orderByName(payload) {
  return {
    type: ORDER_BY_NAME,
    payload,
  };
}

export function orderByRating(payload) {
  return {
    type: ORDER_BY_RATING,
    payload,
  };
}

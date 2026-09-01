import {
  GET_VIDEOGAMES, // 1 este reducer trae las accion con las que va a trabajar
  GET_GENRES, //4
  GET_DETAILS, //9
  CLEAN_VIDEOGAMES, //2
  CLEAR_DETAIL,
  FILTER_BY_GENDER, //7
  FILTER_BY_CREATED, //5
  ORDER_BY_NAME, //6
  GET_NAME_VIDEOGAME, //3
  POST_VIDEOGAME, //  jkj
  ORDER_BY_RATING, //8
  CLEAR_DETAIL_GENRE,
  GET_ALL_PLATFORMS

} from '../actions'

//----------->>>>ESTADO QUE SE VA A SETEAR CON LAS ACTIONS<<<<-------//
const initialState = {
  videogames: [],
  allVideogames: [],
  genres: [],
  gameDetail: [],
  platforms: [],
}

//---->>>>REDUCER<<<<------//

function rootReducer(state = initialState, { type, payload }) {
  //tiene dos parametros   el estado   y la accion (state= initialState, action )
  switch (
    type //  switch(action.type){}
  ) {
    case GET_VIDEOGAMES:
      return {
        ...state,
        videogames: payload, //action.payload
        allVideogames: payload, //action.payload
      }
    case CLEAN_VIDEOGAMES:
      return {
        ...state,
        videogames: payload,
      }
    case GET_GENRES:
      return {
        ...state,
        genres: payload,
      }
    case POST_VIDEOGAME:
      return {
        ...state,
        videogames: [...state.videogames, payload],
      }
    case GET_DETAILS:
      return {
        ...state,
        gameDetail: payload,
      }
    case GET_NAME_VIDEOGAME:
      return {
        ...state,
        videogames: payload,
      }
    case CLEAR_DETAIL:
      return {
        ...state,
        gameDetail: [],
      }
    case CLEAR_DETAIL_GENRE:
      return {
        ...state,
        genres: [],
      }

    case FILTER_BY_GENDER:
      let stateGenre = state.videogames
      let genreFiltered =
        payload === 'All'
          ? stateGenre
          : stateGenre.filter((e) => {
              if (!e.createdInDB) {
                if (e.genres.some((e) => e === payload)) {
                  return e
                }
              } else if (e.createdInDB) {
                if (e.genres.some((e) => e.name === payload)) {
                  return e
                }
              }
              return false
            })
      if (genreFiltered.length <= 0) {
        genreFiltered = stateGenre
        alert('There are no videogames of the indicated genre')
      }
      return {
        ...state,
        videogames: genreFiltered,
      }
    case FILTER_BY_CREATED: //de la api o creado
      let stateUno = state.allVideogames
      let videogameCreated
      if (payload === 'Created') {
        //console.log(stateUno);    el estado de todos los videogames
        videogameCreated = stateUno.filter((e) => e.createdInDB) //se trae del modelo
        videogameCreated.length === 0
          ? alert('videogame not created')
          : console.log('ok found!!')
      } else if (payload === 'api') {
        videogameCreated = stateUno.filter((e) => !e.createdInDB)
      } else {
        videogameCreated = stateUno
      }
      return {
        ...state,
        videogames: videogameCreated,
      }

    case ORDER_BY_NAME:
      let statevideog = state.videogames
      let sortedName =
        payload === 'asc'
          ? statevideog.sort((a, b) => {
              return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            })
          : statevideog.sort((a, b) => {
              return b.name.toLowerCase().localeCompare(a.name.toLowerCase())
            })
      return {
        ...state,
        videogames: sortedName,
      }
    case GET_ALL_PLATFORMS:
      return{
        ...state,
        platforms: payload,
      }  

    case ORDER_BY_RATING:
      let sortedGames1 =
        payload === 'ratasc'
          ? state.videogames.sort(function (a, b) {
              if (a.rating > b.rating) {
                return 1
              }
              if (b.rating > a.rating) {
                return -1
              }
              return 0
            }) // payload !=='ratasc'
          : state.videogames.sort(function (a, b) {
              if (a.rating > b.rating) {
                return -1
              }
              if (b.rating > a.rating) {
                return 1
              }
              return 0
            })
      return {
        ...state,
        videogames: sortedGames1,
      }
    default:
      return state
  }
}

export default rootReducer

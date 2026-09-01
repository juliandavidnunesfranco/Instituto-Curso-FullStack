import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./CreateVideogame.css";

//------>>>>>Actions
import {
  getGenres,
  postVideogame,
  cleanVideogames,
  getAllPlatforms,
} from "../actions";

const CreateVideogame = () => {
  ///------------>>>>>>>>Estados y sus Set
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllPlatforms());
    dispatch(getGenres());
  }, [dispatch]);

  ///----->>>>>>>seleccionar el estado genres con useSelector
  const genres = useSelector((state) => state.genres);
  const platforms = useSelector((state) => state.platforms);
  const [errors, setErrors] = useState({});
  const history = useHistory(); //////--------->>>>>Props de DOM

  const [input, setInput] = useState({
    ///--------->>>>Estado de los input
    name: "",
    description: "",
    release: "",
    rating: "",
    genres: [],
    platforms: [],
    img: "",
  });
  ///////// regex /////// expresiones regulares

  let noEmpty = /\S+/; //---------->>>>>>> los caracteres que no son espacios en blanco.
  let validateName = /^.{5,200}$/; ///------------->>>>>>>> los caracteres estes en el rango de 5 a 200
  let validateNum = /^[1-5]+([.][1-5]+)?$/; //------>>>>>>>Validar que este en el rango de enteros entre 1-5 o flotantes de  1-5
  let validateUrl = /(https?:\/\/.*\.(?:png|jpg))/i; ////----------->>>>>>que inicie por https y termine en . png o jpg
  let validateDate = /^\d{4}\/\d{2}\/\d{2}$/; //------>>>>validar que el date tenga el orden de 4 caracteres luego dos y luego dos
  let validateWords = /^.{5,100}$/; ///------->>>>>validar que este en el rango entre 5 - 100

  const validate = (input) => {
    ///------>>>>>>  a los componentes inputs se les evalua con los regex
    let errors = {}; //--->>>es un objeto
    if (
      !noEmpty || ///------>>>> si esta vacio  o
      !validateName || ///----->>>no cumple name o
      input.name.length < 5 ///------>>>>name tiene una longitud menor que 5 caracteres
    ) {
      ///----->>>>>>entonces
      errors.name = "Name required. more than 5 characters"; ///------>>>>el objeto error (estado) tendra el name "..."
    }
    if (!validateNum || parseInt(input.rating) < 1) {
      ///------>>>>>>Valida que si no cumple con numeros entre 1-5 o son menores que 1 entonces
      errors.rating = "Number required. Higher than 1"; ///------->>>>>el objeto errors con su rating sera "..."
    }
    if (!validateDate || parseInt(input.release) < 1) {
      ///------>>>>>>si no cumple con el date primero 4 luego 2 y luego 2 digitos entonces
      errors.release = "release required. YYYY/MM/DD"; ///---->>>>> el estado error (objeto) con su value release sera "..."
    }
    if (
      !validateWords || ///----->>>>>sino cumple con un rango de palabras
      parseInt(input.description) < 1 ///------>>>> o el rango de palabras es menor a 1  o sea 0
    ) {
      //------->>>>>entonces
      errors.description = /// ---->>>>> objeto error con su value description sera "..."
        "Description required. Higher than 5 characters and less than 200 ";
    }
    if (!validateUrl) {
      ///----->>>>>.test(input.img)
      errors.img = "URL required";
    }
    return errors; ////------->>>>>>>aca devolvemos el error de acuerdo a lo que suceda
  };

  const handleChange = (e) => {
    setInput({
      ///seteamos el input ... con el valor que vamos digitando
      ...input,
      [e.target.name]: e.target.value,
    });
    setErrors(
      validate({
        ...input,
        [e.target.name]: e.target.value, ///---->>>>> al error tambien se le carga el value = e.target.value
      })
    );
  };

  const handleSelect = (e) => {
    if (input.genres.length < 2) {
      setInput({
        ...input,
        genres: [...input.genres, e.target.value],
      });
      e.target.value = "Select genre";
    } else {
      alert("You cannot choose more than two genres of videogame");
    }
  };

  const handleSelectOne = (e) => {
    if (input.platforms.length < 2) {
      setInput({
        ...input,
        platforms: [...input.platforms, e.target.value],
      });
      e.target.value = "Select platform";
    } else {
      alert("You cannot choose more than two platforms of videogame");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !errors.name &&
      !errors.rating &&
      !errors.release &&
      !errors.description &&
      !errors.img
    ) {
      dispatch(postVideogame(input));
      setInput({
        name: "",
        rating: "",
        release: "",
        description: "",
        genres: [],
        platforms: [],
        img: "",
      });
      dispatch(cleanVideogames(dispatch));
      history.push("/home");
    } else {
      alert("Error. Check the form");
    }
  };

  const handleDelete = (e) => {
    setInput({
      ...input,
      genres: input.genres.filter((genre) => genre !== e),
      platforms: input.platforms.filter((platforms) => platforms !== e),
    });
  };

  return (
    <div>
      <button className="button-atras" onClick={() => history.goBack()}>
        Atras
      </button>
      <form
        className="container-form"
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <div className="title">
          <h2>Create Videogame</h2>
        </div>
        <div>
          <div className="container-inputs">
            <label>Name: </label>
            <input
              type="text"
              value={input.name}
              name="name"
              onChange={(e) => {
                handleChange(e);
              }}
              placeholder="Name"
            />
            <p>{errors.name}</p>
            <label>Rating: </label>
            <input
              type="number"
              value={input.rating}
              name="rating"
              onChange={(e) => {
                handleChange(e);
              }}
              placeholder="Rating 1-5"
            />
            <p>{errors.rating}</p>
            <label>Release: </label>
            <input
              type="text"
              value={input.release}
              name="release"
              onChange={(e) => {
                handleChange(e);
              }}
              placeholder="YYYY/MM/DD"
            />
            <p>{errors.release}</p>
          </div>
        </div>
        <div className="container-seconds-inputs">
          <label>Image: </label>
          <input
            type="text"
            value={input.img}
            name="img"
            onChange={(e) => {
              handleChange(e);
            }}
            placeholder="URL Image..."
          />
          <p>{errors.img}</p>
          <label>Description: </label>
          <textarea
            type="text"
            value={input.description}
            name="description"
            onChange={(e) => {
              handleChange(e);
            }}
            placeholder="Description"
          />
          <p>{errors.description}</p>
        </div>
        <div>
          <select
            onChange={(e) => {
              handleSelect(e);
            }}
          >
            <option>Select Genre</option>
            {genres?.map((e) => {
              return (
                <option key={e.id} value={e.name}>
                  {e.name}
                </option>
              );
            })}
          </select>
          {input.genres?.map((e) => {
            return (
              <div key={e}>
                <p>{e}</p>
                <button
                  onClick={() => {
                    handleDelete(e);
                  }}
                >
                  X
                </button>
              </div>
            );
          })}
        </div>
        <div>
          <select onChange={(e) => {handleSelectOne(e)}}>
              <option>Select Platform</option>
              {platforms?.map((e) => {
                  return (
                    <option key={e.id} value={e.name}>
                      {e.name}
                </option>
              );
            })}
          </select>
          {input.platforms?.map((e) => {
            return (
              <div key={e}>
                <p>{e}</p>
                <button
                  onClick={() => {
                    handleDelete(e);
                  }}
                >
                  X
                </button>
              </div>
            );
          })}
          <button
            className="button-create"
            type="submit"
            disabled={
              !input.name ||
              !input.rating ||
              !input.release ||
              !input.description ||
              !input.genres
            }
          >
            Create!
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVideogame;

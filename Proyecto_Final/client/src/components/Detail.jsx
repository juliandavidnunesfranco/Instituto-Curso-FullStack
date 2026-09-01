import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearVideogameDetail, getVideogameDetail } from "../actions";
import { useEffect } from "react";
import "./Detail.css";
function Detail(props) {
  const dispatch = useDispatch();
  const { history, match } = props;

  useEffect(() => {
    dispatch(clearVideogameDetail(dispatch));
    dispatch(getVideogameDetail(match.params.id));
  }, [dispatch, match.params.id]);

  const idVideogame = useSelector((state) => state.gameDetail); //gameDetail

  return (
    <React.Fragment>
      <div className="btn-atras">
        <button
          className="button-detail-atras"
          onClick={() => history.push("/home")}
        >
          Atras
        </button>
      </div>

      <div className="container">
        <img
          className="imagen-detail"
          src={idVideogame.image}
          alt="img not found"
        />
        <div className="title-central-down">
          <h2>{idVideogame.name}</h2>
        </div>
        <div className="rating">
          <h2>Rating: </h2>
          <p>{idVideogame.rating}</p>
        </div>

        <div className="detail">
          <h2>Generos: </h2>
          <p>{idVideogame.genres}</p>
        </div>

        <div className="release">
          <h2>Released: </h2>
          <p>{idVideogame.release}</p>
        </div>
        <div className="platforms">
          <h2>Platforms: </h2>
          <p>{idVideogame.platforms}</p>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Detail;

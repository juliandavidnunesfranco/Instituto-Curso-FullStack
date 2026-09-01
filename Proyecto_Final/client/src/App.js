import './App.css';
import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Home from './components/Home';
import  CreateVideogame  from "./components/CreateVideogame";
import Detail from './components/Detail';

function App() {
    return(
    
      <BrowserRouter>
          <React.Fragment>

            <Route exact path="/" component={LandingPage}/>
            <Route path="/home" component={Home}/>
            <Route path="/create" component={CreateVideogame}/>
            <Route exact path="/videogames/:id" component={Detail}/>

          </React.Fragment>           
      </BrowserRouter>
    
    )

};


export default App;

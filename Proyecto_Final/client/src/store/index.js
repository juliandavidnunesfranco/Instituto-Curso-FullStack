import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducer';

const composeEn = (typeof window !== "undefined" && 
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(rootReducer,composeEn(applyMiddleware(thunk)));

export default store;


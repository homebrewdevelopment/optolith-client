import { render } from 'react-dom';
import * as React from 'react';
import AppDispatcher from './dispatcher/AppDispatcher';
import Router from './views/Router';
import { getAllData } from './utils/WebAPIUtils';
import './main.scss';

window.onunload = function() {
	// WebAPIUtils.logoutSync();
	AppDispatcher.dispatch({
		type: 'LOGOUT_SUCCESS'
	});
};

render( <Router />, document.querySelector('#bodywrapper') );

getAllData();

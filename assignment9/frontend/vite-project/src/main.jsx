import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import store from './store';
import { logout } from './store/slices/authSlice';
import { setUnauthorizedHandler } from './api/client';

// On a 401 the API client clears storage and calls this to reset Redux state
setUnauthorizedHandler(() => store.dispatch(logout()));

createRoot(document.getElementById('root')).render(
   <Provider store={store}>
     <App />
  
   </Provider> 
   
)

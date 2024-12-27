import React from 'react';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from './views/Home'
import Auth from './views/Auth';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Auth/>}/>
      <Route path="/home" element={<Home/>}/>
      <Route path="*" element={<h1>Not Found</h1>}/>
    </Routes>
    </BrowserRouter>
  );
}

export default App;

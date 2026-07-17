import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';

import Menu from './components/menus/menu/Menu';
import Login from './components/login/Login';
import Register from './components/register/Register';
import MenuAdm from './components/menus/menuAdm/MenuAdm';
import FinalizarCompra from './components/compra/FinalizarCompra';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/inicio" element={<Menu />} />
        <Route path="/menuAdm" element={<MenuAdm />} />
        <Route path="/compra" element={<FinalizarCompra />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Shop from './components/Shop'
import Product from './components/common/Product'
import Cart from './components/common/Cart'
import Checkout from './components/Checkout'
import Login from './components/admin/Login'
import { ToastContainer,toast } from 'react-toastify'
import Dashboard from './components/admin/Dashboard'
import { AdminRequireAuth } from './components/admin/AdminRequireAuth'
import { AdminAuthProvider } from './components/context/AdminAuth';
import {default as ShowCategories} from './components/admin/category/Show'
import {default as CreateCategory} from './components/admin/category/Create'
import {default as EditCategory} from './components/admin/category/Edit'
import {default as ShowBrands} from './components/admin/brand/Show'
import {default as CreateBrand} from './components/admin/brand/Create'
import {default as EditBrand} from './components/admin/brand/Edit'


function App() {

  return (
    <>
      <BrowserRouter>
      <AdminAuthProvider>      
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/shop' element={<Shop/>}/>
          <Route path='/product' element={<Product/>}/>
          <Route path='/cart' element={<Cart/>}/>
          <Route path='/checkout' element={<Checkout/>}/>
          <Route path='/admin/login' element={<Login/>}/>
          <Route path='/admin/dashboard' element={
              <AdminRequireAuth>
                 <Dashboard/>
              </AdminRequireAuth>
          }/>
          <Route path='/admin/categories' element={
              <AdminRequireAuth>
                 <ShowCategories/>
              </AdminRequireAuth>
          }/>
          <Route path='/admin/categories/create' element={
              <AdminRequireAuth>
                 <CreateCategory/>
              </AdminRequireAuth>
          }/>
         <Route path='/admin/categories/edit/:id' element={
              <AdminRequireAuth>
                 <EditCategory/>
              </AdminRequireAuth>
          }/>
          <Route path='/admin/brands' element={
              <AdminRequireAuth>
                 <ShowBrands/>
              </AdminRequireAuth>
          }/>
          <Route path='/admin/brands/create' element={
              <AdminRequireAuth>
                 <CreateBrand/>
              </AdminRequireAuth>
          }/>
         <Route path='/admin/brands/edit/:id' element={
              <AdminRequireAuth>
                 <EditBrand/>
              </AdminRequireAuth>
          }/>


        </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
      <ToastContainer/>
    </>
  )
}

export default App

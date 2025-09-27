import React from 'react'
import Layout from './common/Layout'
import Hero from './common/Hero'
import ProductImg from '../assets/images/eight.jpg';
import { Link } from 'react-router-dom';

const shop = () => {
  return (
    <Layout>
      <div className="container">
        <nav aria-label='breadcrumb' className='py-4'>
          <ol className='breadcrumb'>
            <li className='breadcrumb-item'><a href="">Home</a></li>
            <li className='breadcrumb-item'><a href="">Shop</a></li>
          </ol>
        </nav>
        <div className="row">
          <div className="col-md-3">
            <div className="card shadow border-0 mb-3">
              <div className="card-body p-4">
                <h3 className='mb-3'>Categories</h3>
                <ul>
                  <li className='mb-2'>
                    <input type="checkbox" />
                    <label htmlFor="" className='ps-2'>Kids</label>
                  </li>
                </ul>
                <ul>
                  <li className='mb-2'>
                    <input type="checkbox" />
                    <label htmlFor="" className='ps-2'>Men</label>
                  </li>
                </ul>
                <ul>
                  <li className='mb-2'>
                    <input type="checkbox" />
                    <label htmlFor="" className='ps-2'>Women</label>
                  </li>
                </ul>
              </div>
            </div>
            <div className="card shadow border-0 mb-3">
              <div className="card-body p-4">
                <h3 className='mb-3'>Brands</h3>
                <ul>
                  <li className='mb-2'>
                    <input type="checkbox" />
                    <label htmlFor="" className='ps-2'>Puma</label>
                  </li>
                </ul>
                <ul>
                  <li className='mb-2'>
                    <input type="checkbox" />
                    <label htmlFor="" className='ps-2'>Killer</label>
                  </li>
                </ul>
                <ul>
                  <li className='mb-2'>
                    <input type="checkbox" />
                    <label htmlFor="" className='ps-2'>Levis</label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-9 mb-5">
              <div className="row">
                <div className="col-md-4 col-6">
                  <div className="product card border-0">
                    <div className="card-img">
                      <link to="/product">
                        <img src={ProductImg} alt="" className='w-100' />
                      </link>
                    </div>
                    <div className="card-body py-3">
                      <Link to="/product">Red Check Shirt for Men</Link>
                      <div className="price">
                        $50 <span className='text-decoration-line-through'>$80</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-6">
                  <div className="product card border-0">
                    <div className="card-img">
                      <img src={ProductImg} alt="" className='w-100' />
                    </div>
                    <div className="card-body py-3">
                      <a href="">Red Check Shirt for Men</a>
                      <div className="price">
                        $50 <span className='text-decoration-line-through'>$80</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-6">
                  <div className="product card border-0">
                    <div className="card-img">
                      <img src={ProductImg} alt="" className='w-100' />
                    </div>
                    <div className="card-body py-3">
                      <a href="">Red Check Shirt for Men</a>
                      <div className="price">
                        $50 <span className='text-decoration-line-through'>$80</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-6">
                  <div className="product card border-0">
                    <div className="card-img">
                      <img src={ProductImg} alt="" className='w-100' />
                    </div>
                    <div className="card-body py-3">
                      <a href="">Red Check Shirt for Men</a>
                      <div className="price">
                        $50 <span className='text-decoration-line-through'>$80</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-6">
                  <div className="product card border-0">
                    <div className="card-img">
                      <img src={ProductImg} alt="" className='w-100' />
                    </div>
                    <div className="card-body py-3">
                      <a href="">Red Check Shirt for Men</a>
                      <div className="price">
                        $50 <span className='text-decoration-line-through'>$80</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-6">
                  <div className="product card border-0">
                    <div className="card-img">
                      <img src={ProductImg} alt="" className='w-100' />
                    </div>
                    <div className="card-body py-3">
                      <a href="">Red Check Shirt for Men</a>
                      <div className="price">
                        $50 <span className='text-decoration-line-through'>$80</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>



          </div>



        </div>
      </div>

    </Layout>
  )
}

export default shop

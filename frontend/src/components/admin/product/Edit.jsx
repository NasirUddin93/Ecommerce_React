import React from 'react'
import Layout from '../../common/Layout'
import Sidebar from '../../common/Sidebar'
import { data, Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { apiUrl } from '../../common/http'
import { adminToken } from '../../common/http'
// import { toast } from 'bootstrap'
import { toast } from 'react-toastify'


const Edit = () => {
   const [disable, setDisable] = useState(false)  
   const [category, setCategories] = useState([])  
  const navigate = useNavigate();
  const params = useParams();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues:async () =>{
            const res = await fetch(`${apiUrl}/categories/${params.id}`,{
                method: 'GET',
                headers: {
                    'Content-type':'application/json',
                    'Accept':'application/json',
                    'Authorization': `Bearer ${adminToken()}`
                }
            })
            .then(res => res.json())
            .then(result => {
                console.log(result)
                if(result.status == 200){
                    setCategories(result.data)  
                    reset({
                        name: result.data.name,
                        status: result.data.status
                    })          
                }else{
                    console.log("Something went wrong");
                }
            })
        }    
  });

  const saveCategory = (data) =>{
        setDisable(true)
        console.log(data);
        const fetchCategories = async () => {
            const res = await fetch(`${apiUrl}/categories/${params.id}`,{
                method: 'PUT',
                headers: {
                    'Content-type':'application/json',
                    'Accept':'application/json',
                    'Authorization': `Bearer ${adminToken()}`
                },
                body:JSON.stringify(data)
            }).then(res => res.json())
            .then(result => {
                setDisable(false)
                if(result.status == 200){
                    toast.success(result.status);   
                    navigate('/admin/categories');             
                }else{
                    console.log("Something went wrong");
                }
            });
        }
        fetchCategories();

    }
  return (
    <Layout>
        <div className="container">
          <div className="row">
              <div className="d-flex justify-content-between mt-5 pb-3">
                <h4 className='h4 pb-0 mb-0'>products / Edit</h4>
                <Link to="/admin/products" className='btn btn-primary'>Back</Link>
              </div>
            <div className="col-md-3">
                <Sidebar/>
            </div>
            <div className="col-md-9">
                <form onSubmit={handleSubmit(saveCategory)}>
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <div className="mb-3">
                                <label htmlFor="" className='form-label'>
                                    Name
                                </label>
                                <input
                                    {
                                        ...register('name',{
                                            required: 'The name field is required'
                                        })
                                    }
                                    type="text" 
                                    className={`form-control ${errors.name ? 'is-invalid':''}`} 
                                    placeholder='Name'/>
                                    {
                                        errors.name && <p className='invalid-feedback'>{errors.name.message}</p>
                                    }
                            </div>
                            <div className="mb-3">
                                <label htmlFor="" className='form-label'>
                                    Status
                                </label>
                                <select
                                    {
                                        ...register('status',{
                                            required: 'Please select a status'
                                        })
                                    }
                                  className={`form-control ${errors.status ? 'is-invalid':''}`} 
                                 >
                                    <option value="">Select a Status</option>
                                    <option value="1">Active</option>
                                    <option value="0">Block</option>
                                </select>
                                    {
                                        errors.status && <p className='invalid-feedback'>{errors.status.message}</p>
                                    }
                            </div>
                        </div>
                    </div>

                    <button className='btn btn-primary mt-3' type='submit' disabled={disable}>Update</button>
                </form>

            </div>
          </div>
        </div>
    </Layout>
  )
}

export default Edit

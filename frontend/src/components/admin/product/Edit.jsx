import React, { useState, useEffect, useRef, useMemo } from 'react';
import Layout from '../../common/Layout'
import Sidebar from '../../common/Sidebar'
import { data, Link, useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { apiUrl } from '../../common/http'
import { adminToken } from '../../common/http'
import { toast } from 'react-toastify'
import JoditEditor from 'jodit-react';
import { reset } from 'jodit/esm/core/helpers';


const Edit = ({ placeholder }) => {
    const editor = useRef(null);
    const [content, setContent] = useState('');
    // const [gallery, setGallery] = useState([]);
    const [productImages, setProductImages] = useState([]);
        // const [galleryImages, setGalleryImages] = useState([]);
    const [disable, setDisable] = useState(false)  
    const [categories, setCategories] = useState([])  
    const [brands, setBrands] = useState([])  
    const [sizes, setSizes] = useState([])  
    const [sizesChecked, setSizesChecked] = useState([])  
    const navigate = useNavigate();
    const params = useParams();
    const config = useMemo(() => ({
            readonly: false, // all options from https://xdsoft.net/jodit/docs/,
            placeholder: placeholder || ''
        }),
        [placeholder]
    );
    const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
    } = useForm({
    defaultValues: async () => {
        const res = await fetch(`${apiUrl}/products/${params.id}`,{
            method: 'GET',
            headers:{
                'Content-type':'application/json',
                'Accept':'application/json',
                'Authorization':`Bearer ${adminToken()}`,
            }
        })
        .then(res => res.json())
        .then(result =>{
            console.log(result);
            setProductImages(result.data.product_images)
            setSizesChecked(result.productSizes)
            reset({
                title:result.data.title,
                category_id:result.data.category_id,
                brand_id:result.data.brand_id,
                sku:result.data.sku,
                short_description:result.data.short_description,
                description:result.data.description,
                price:result.data.price,
                compare_price:result.data.compare_price,
                barcode:result.data.barcode,
                status:result.data.status,
                is_featured:result.data.is_featured
            })
        })
    }
    });
    
    const saveProduct = async (data) =>{
    const formData = {...data,
        "description":content,
        }
        setDisable(true)
        console.log(formData);
            const res = await fetch(`${apiUrl}/products/${params.id}`,{
                method: 'PUT',
                headers: {
                    'Content-type':'application/json',
                    'Accept':'application/json',
                    'Authorization': `Bearer ${adminToken()}`
                },
                body:JSON.stringify(formData)
            })
            .then(res => res.json())
            .then(result => {
                setDisable(false)
                if(result.status == 200){
                    toast.success(result.status);   
                    navigate('/admin/products');             
                }else{
                    if(result.errors){
                        const formErrors = result.errors;
                        Object.keys(formErrors).forEach((field)=>{
                            setError(field,{message:formErrors[field][0]});
                        });
                        toast.error("Please fix the errors in the form.");
                    }else{
                        toast.error("Server error. Please check backend logs.");
                    }
                }
                })
                .catch(error => {
                    console.log(error);
                setDisable(false);
                toast.error("Network error occurred.");
            });
    }

    const fetchCategories =async () =>{
        const res = await fetch(`${apiUrl}/categories`,{
            method: 'GET',
            headers:{
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${adminToken()}`
            }
        })
        .then(res => res.json())
        .then(result => {
            console.log(result)
            setCategories(result.data);
            
        })
    }
   const fetchBrands =async () =>{
        const res = await fetch(`${apiUrl}/brands`,{
            method: 'GET',
            headers:{
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${adminToken()}`
            }
        })
        .then(res => res.json())
        .then(result => {
            console.log(result)
            setBrands(result.data);
            
        })
    }

    const handleFile =async (e)=>{
        const formData = new FormData();
        const file = e.target.files[0];
        formData.append('image',file);
        setDisable(true)

        const res = await fetch(`${apiUrl}/save-product-image`,{
            method: 'POST',
            headers:{
                'Accept':'application/json',
                'Authorization':`Bearer ${adminToken()}`
            },
            body: formData
        })
        .then(res => res.json())
        .then(result => {
            console.log(result);
            if(result.status == 200){
                productImages.push(result.data);
                setProductImages(productImages);
            }else{
                toast.error(result.error.image[0]);
            }
            //gallery.push(result.data.id);
            //setGallery(gallery);
            //galleryImages.push(result.data.image_url);
            //setGalleryImages(galleryImages);
            setDisable(false);
            e.target.value = "";
        })

    }
    const deleteImage = async (image) =>{
        if(!window.confirm("Are you sure you want to delete this image?")){
            return;
        }
        setDisable(true);
        const res = await fetch(`${apiUrl}/delete-product-image/${image.id}`,{
            method: 'DELETE',       

            headers:{
                'Content-type':'application/json',
                'Accept':'application/json',    
            },
            body:JSON.stringify({
                'id':image.id
            }),
        })
        .then(res => res.json())    
        .then(result => {
            setDisable(false);
            if(result.status == 200){
                const filteredImages = productImages.filter((img)=>{
                    return img.id != image.id;
                })
                setProductImages(filteredImages);
                toast.success(result.message);
            }   
        })
    }
    const changeImage = async (image) =>{
        setDisable(true);
        const res = await fetch(`${apiUrl}/change-product-image?product_id=${params.id}&image=${image}`,{
            method: 'GET',  
            headers:{
                'Content-type':'application/json',
                'Accept':'application/json',
                'Authorization':`Bearer ${adminToken()}`,
            }
        })
        .then(res => res.json())    
        .then(result => {
            setDisable(false);
            if(result.status == 200){
                const filteredImages = productImages.map((img)=>{
                    if(img.id == image.id){
                        img.is_default = 'yes';
                    }else{
                        img.is_default = 'no';
                    }   
                    return img;
                })
                setProductImages(filteredImages);
                toast.success(result.message);
            }
        })
    }   


    const fetchSizes =async () =>{
        const res = await fetch(`${apiUrl}/sizes`,{
            method: 'GET',
            headers:{
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${adminToken()}`
            }
        })
        .then(res => res.json())
        .then(result => {
            console.log(result)
            setSizes(result.data);
            
        })
    }

    useEffect(()=>{
        fetchCategories();
        fetchBrands();
        fetchSizes();
    },[])
  
  return (
    <Layout>
        <div className="container">
          <div className="row">
              <div className="d-flex justify-content-between mt-5 pb-3">
                <h4 className='h4 pb-0 mb-0'>Products / Create</h4>
                <Link to="/admin/Products" className='btn btn-primary'>Back</Link>
              </div>
            <div className="col-md-3">
                <Sidebar/>
            </div>
            <div className="col-md-9">
                <form onSubmit={handleSubmit(saveProduct)}>
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <div className="mb-3">
                                <label htmlFor="" className='form-label'>
                                    Title
                                </label>
                                <input
                                    {
                                        ...register('title',{
                                            required: 'The title field is required'
                                        })
                                    }
                                    type="text" 
                                    className={`form-control ${errors.title ? 'is-invalid':''}`} 
                                    placeholder='title'/>
                                    {
                                        errors.title && <p className='invalid-feedback'>{errors.title.message}</p>
                                    }
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className='form-label' htmlFor="">Category</label>
                                        <select
                                        {
                                            ...register('category_id',{
                                                required: 'Please select a category'
                                            })
                                        }
                                        className={`form-control ${errors.category_id && 'is-invalid'}`}                                        
                                        >
                                            <option value="">Select Category</option>
                                            {
                                                categories && categories.map((category) => {
                                                    return (
                                                        <option key={`category-${category.id}`} value={category.id}>{category.name}</option>
                                                    )
                                                })
                                            }
                                        </select>
                                        {
                                            errors.category && <p className='invalid-feedback'>{errors.category_id.message}</p>
                                        }
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className='form-label' htmlFor="">Brand</label>
                                        <select
                                        {
                                            ...register('brand_id',{
                                                required: 'Please select a brand'
                                            })
                                        }
                                        className={`form-control ${errors.brand_id && 'is-invalid'}`}                                        
                                        >
                                            <option value="">Select Brand</option>
                                            {
                                                brands && brands.map((brand) => {
                                                    return (
                                                        <option key={`category-${brand.id}`} value={brand.id}>{brand.name}</option>
                                                    )
                                                })
                                            }
                                        </select>
                                        {
                                            errors.category && <p className='invalid-feedback'>{errors.category.message}</p>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className='form-label' htmlFor="">Short Description</label>
                                <textarea
                                {
                                    ...register('short_description',{
                                        required: 'Short Description field is required'
                                    })
                                }
                                className='form-control' placeholder='Short Description' rows={3}></textarea>
                            </div>
                            
                            <div className="mb-3">
                                <label htmlFor="" className='form-label'>Description</label>
                                <JoditEditor
                                    ref={editor}
                                    value={content}
                                    config={config}
                                    tabIndex={1} // tabIndex of textarea
                                    onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                                    onChange={newContent => {}}
                                />
                            </div>
                            <h3 className='py-3 border-bottom mb-3'>Pricing</h3>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="" className='form-label'>Price</label>
                                        <input
                                        {
                                            ...register('price',{
                                                required: 'Price field is required'
                                            })
                                        }
                                        type="text"
                                         className={`form-control ${errors.price ? 'is-invalid':''}`}
                                         placeholder='Price'/>
                                        {
                                            errors.price && <p className='invalid-feedback'>{errors.price.message}</p>
                                        }
                                    </div>
                                </div>
                               <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="" className='form-label'>Compare Price</label>
                                        <input
                                         {
                                            ...register('compare_price',{
                                                required: 'Price field is required'
                                            })
                                        }
                                        type="text" className='form-control' placeholder='Discount Price'/>
                                    </div>
                                </div>

                            </div>
                            <h3 className='py-3 border-bottom mb-3'>Inventory</h3>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="" className='form-label'>SKU</label>
                                        <input
                                        {
                                            ...register('sku',{
                                                required: 'SKU field is required'
                                            })
                                        }
                                        type="text"
                                         className={`form-control ${errors.sku ? 'is-invalid':''}`} 
                                         placeholder='Sku'/>
                                         {
                                            errors.sku && <p className='invalid-feedback'>{errors.sku.message}</p>
                                        }
                                    </div>
                                </div>
                               <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="" className='form-label'>Barcode</label>
                                        <input
                                         {
                                            ...register('barcode',{
                                                required: 'bar field is required'
                                            })
                                        }
                                        type="text" className='form-control' placeholder='Barcode'/>
                                    </div>
                                </div>

                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="" className='form-label'>Qty</label>
                                        <input
                                         {
                                            ...register('qty',{
                                                
                                            })
                                        }
                                        type="text" className='form-control' placeholder='Qty'/>
                                    </div>
                                </div>
                               <div className="col-md-6">
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
                                <div className="mb-3">
                                    <label htmlFor="" className='form-label'>
                                        Featured
                                    </label>
                                    <select
                                        {
                                            ...register('is_featured',{
                                                required: 'Please select a featured'
                                            })
                                        }
                                    className={`form-control ${errors.is_featured ? 'is-invalid':''}`} 
                                    >
                                       <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                        {
                                            errors.is_featured && <p className='invalid-feedback'>{errors.is_featured.message}</p>
                                        }
                                </div>
                            </div>
                            <div className="mb-3">
                                {
                                    sizes && sizes.map((size)=>{
                                        return(
                                            <div className="form-check form-check-inline" key={`size-${size.id}`}>
                                                <input 
                                                {
                                                    ...register('sizes')
                                                }
                                                className='form-check-input' type="checkbox" id={`size-${size.id}`} value={size.id}/>
                                                <label htmlFor={`size-${size.id}`} className='form-check-label'>{size.name}</label>
                                            </div>
                                        )
                                    })
                                }
                            </div>


                            <h3 className='py-3 border-bottom mb-3'>Gallery</h3>
                            <div className="mb-3">
                                <label htmlFor="" className='form-label'>Image</label>
                                <input
                                onChange={handleFile}
                                type="file" className='form-control'/>
                            </div> 

                            <div className='mb-3'>
                                <div className="row">
                                    {
                                        productImages && productImages.map((productImages,index)=>{
                                            return(
                                                <div className="col-md-3" key={`image-${index}`}>
                                                    <div className="card shadow">
                                                        <img src={productImages.image_url} alt="" className='w-100' />
                                                    </div>
                                                        <button className='btn btn-danger mt-3 w-100' onClick={()=>deleteImage(productImages)}>Delete</button>
                                                        {/* <button className='btn btn-danger mt-3 w-100' onClick={()=>changeImage(productImages.image)}>Set as Default</button> */}
                                                        <button
                                                        type="button"
                                                        className="btn btn-warning mt-3 w-100"
                                                        onClick={() => changeImage(productImages)}
                                                        >
                                                        Set as Default
                                                        </button>

                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                
                            </div>                          

                        </div>
                    </div>

                    <button className='btn btn-primary mt-3 mb-5' type='submit' disabled={disable}>Update</button>
                </form>

            </div>
          </div>
        </div>
    </Layout>
  )
}

export default Edit

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Layout from '../../common/Layout'
import Sidebar from '../../common/Sidebar'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { adminToken,apiUrl } from '../../common/http'   
import JoditEditor from 'jodit-react';
import { image } from 'jodit/esm/plugins/image/image';


const Create = ({ placeholder }) => {
    const editor = useRef(null);
    const [content, setContent] = useState('');
    const [gallery, setGallery] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);
  const [disable, setDisable] = useState(false)  
  const [categories, setCategories] = useState([])  
  const [brands, setBrands] = useState([])  
  const [selectedSizes, setSelectedSizes] = useState([]);
  const navigate = useNavigate();
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
    formState: { errors },
  } = useForm();

  const saveProduct = async (data) =>{
    const formData = {...data,
        "description":content,
         "gallery":gallery,
         "sizes": selectedSizes // Add sizes if you have this state
        }
        setDisable(true)
        console.log("Submited Form:",formData);
            try {
                const res = await fetch(`${apiUrl}/products`,{
                method: 'POST',
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
                    const formErrors = result.errors;
                    Object.keys(formErrors).forEach((field)=>{
                        setError(field,{message:formErrors[field][0]});
                    })
                }
             })
            } catch (error) {
                console.log(error);
                setDisable(false);
                 toast.error("Network error occurred.");
            }            
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

    const fetchSizes = async () => {
        const res = await fetch(`${apiUrl}/sizes`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${adminToken()}`
            }
        })
        .then(res => res.json())
        .then(result => {
            setSizes(result.data);
        })
    }

    // Add this handler for size selection
    const handleSizeChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedSizes(prev => [...prev, parseInt(value)]);
        } else {
            setSelectedSizes(prev => prev.filter(size => size !== parseInt(value)));
        }
    }

    const handleFile =async (e)=>{
        const file = e.target.files[0];
        if(!file){
            toast.error("Please select a file");
            return;
        }
        const formData = new FormData();
        formData.append('image',file);
        setDisable(true)
        try{
           const res = await fetch(`${apiUrl}/temp-images`,{
            method: 'POST',
            headers:{
                'Accept':'application/json',
                'Authorization':`Bearer ${adminToken()}`
            },
            body: formData
            })
            // .then(res => res.json())
            // .then(result => {
            //     console.log(result);
            //     gallery.push(result.data.id);
            //     setGallery(gallery);
            //     galleryImages.push(result.data.image_url);
            //     setGalleryImages(galleryImages);
            //     setDisable(false);
            //     e.target.value = "";
            // })
            const result = await res.json();
            console.log(result);
            
            if(result.status == 200){
                // Update both gallery IDs and gallery images
                setGallery(prev => [...prev, result.data.id]);
                setGalleryImages(prev => [...prev, {
                    id: result.data.id,
                    image_url: result.data.image_url || `/uploads/temp/thumb/${result.data.name}`,
                    name: result.data.name
                }]);
                        } else {
                toast.error("Failed to upload image");
            }
        }catch(error){
            console.log(error);
            toast.error("Network error occurred.");
        }finally{
            setDisable(false);
            e.target.value = "";
        }       

    }

    const deleteImage = () =>{
        // const newGallery = galleryImages.filter(gallery => gallery != image)
        // setGalleryImages(newGallery)
                // Remove from both arrays
        setGallery(prev => prev.filter(id => id !== imageToDelete.id));
        setGalleryImages(prev => prev.filter(img => img.id !== imageToDelete.id));
    }

    const setPrimaryImage = (image) => {
        // Reorder array to put primary image first
        const filtered = galleryImages.filter(img => img.id !== image.id);
        setGalleryImages([image, ...filtered]);
        
        // Also update gallery IDs array to maintain order
        const filteredIds = gallery.filter(id => id !== image.id);
        setGallery([image.id, ...filteredIds]);
        
        toast.info("Primary image set (first image will be primary)");
    }



    useEffect(()=>{
        fetchCategories();
        fetchBrands();
        fetchSizes();
    },[])



//   return (
//     <Layout>
//         <div className="container">
//           <div className="row">
//               <div className="d-flex justify-content-between mt-5 pb-3">
//                 <h4 className='h4 pb-0 mb-0'>Products / Create</h4>
//                 <Link to="/admin/Products" className='btn btn-primary'>Back</Link>
//               </div>
//             <div className="col-md-3">
//                 <Sidebar/>
//             </div>
//             <div className="col-md-9">
//                 <form onSubmit={handleSubmit(saveProduct)}>
//                     <div className="card shadow">
//                         <div className="card-body p-4">
//                             <div className="mb-3">
//                                 <label htmlFor="" className='form-label'>
//                                     Title
//                                 </label>
//                                 <input
//                                     {
//                                         ...register('title',{
//                                             required: 'The title field is required'
//                                         })
//                                     }
//                                     type="text" 
//                                     className={`form-control ${errors.title ? 'is-invalid':''}`} 
//                                     placeholder='title'/>
//                                     {
//                                         errors.title && <p className='invalid-feedback'>{errors.title.message}</p>
//                                     }
//                             </div>
//                             <div className="row">
//                                 <div className="col-md-6">
//                                     <div className="mb-3">
//                                         <label className='form-label' htmlFor="">Category</label>
//                                         <select
//                                         {
//                                             ...register('category_id',{
//                                                 required: 'Please select a category'
//                                             })
//                                         }
//                                         className={`form-control ${errors.category_id && 'is-invalid'}`}                                        
//                                         >
//                                             <option value="">Select Category</option>
//                                             {
//                                                 categories && categories.map((category) => {
//                                                     return (
//                                                         <option key={`category-${category.id}`} value={category.id}>{category.name}</option>
//                                                     )
//                                                 })
//                                             }
//                                         </select>
//                                         {
//                                             errors.category && <p className='invalid-feedback'>{errors.category_id.message}</p>
//                                         }
//                                     </div>
//                                 </div>
//                                 <div className="col-md-6">
//                                     <div className="mb-3">
//                                         <label className='form-label' htmlFor="">Brand</label>
//                                         <select
//                                         {
//                                             ...register('brand_id',{
//                                                 required: 'Please select a brand'
//                                             })
//                                         }
//                                         className={`form-control ${errors.brand_id && 'is-invalid'}`}                                        
//                                         >
//                                             <option value="">Select Brand</option>
//                                             {
//                                                 brands && brands.map((brand) => {
//                                                     return (
//                                                         <option key={`category-${brand.id}`} value={brand.id}>{brand.name}</option>
//                                                     )
//                                                 })
//                                             }
//                                         </select>
//                                         {
//                                             errors.category && <p className='invalid-feedback'>{errors.category.message}</p>
//                                         }
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="mb-3">
//                                 <label className='form-label' htmlFor="">Short Description</label>
//                                 <textarea
//                                 {
//                                     ...register('short_description',{
//                                         required: 'Short Description field is required'
//                                     })
//                                 }
//                                 className='form-control' placeholder='Short Description' rows={3}></textarea>
//                             </div>
                            
//                             <div className="mb-3">
//                                 <label htmlFor="" className='form-label'>Description</label>
//                                 <JoditEditor
//                                     ref={editor}
//                                     value={content}
//                                     config={config}
//                                     tabIndex={1} // tabIndex of textarea
//                                     onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
//                                     onChange={newContent => {}}
//                                 />
//                             </div>
//                             <h3 className='py-3 border-bottom mb-3'>Pricing</h3>
//                             <div className="row">
//                                 <div className="col-md-6">
//                                     <div className="mb-3">
//                                         <label htmlFor="" className='form-label'>Price</label>
//                                         <input
//                                         {
//                                             ...register('price',{
//                                                 required: 'Price field is required'
//                                             })
//                                         }
//                                         type="text"
//                                          className={`form-control ${errors.price ? 'is-invalid':''}`}
//                                          placeholder='Price'/>
//                                         {
//                                             errors.price && <p className='invalid-feedback'>{errors.price.message}</p>
//                                         }
//                                     </div>
//                                 </div>
//                                <div className="col-md-6">
//                                     <div className="mb-3">
//                                         <label htmlFor="" className='form-label'>Compare Price</label>
//                                         <input
//                                          {
//                                             ...register('compare_price',{
//                                                 required: 'Price field is required'
//                                             })
//                                         }
//                                         type="text" className='form-control' placeholder='Discount Price'/>
//                                     </div>
//                                 </div>

//                             </div>
//                             <h3 className='py-3 border-bottom mb-3'>Inventory</h3>
//                             <div className="row">
//                                 <div className="col-md-6">
//                                     <div className="mb-3">
//                                         <label htmlFor="" className='form-label'>SKU</label>
//                                         <input
//                                         {
//                                             ...register('sku',{
//                                                 required: 'SKU field is required'
//                                             })
//                                         }
//                                         type="text"
//                                          className={`form-control ${errors.sku ? 'is-invalid':''}`} 
//                                          placeholder='Sku'/>
//                                          {
//                                             errors.sku && <p className='invalid-feedback'>{errors.sku.message}</p>
//                                         }
//                                     </div>
//                                 </div>
//                                <div className="col-md-6">
//                                     <div className="mb-3">
//                                         <label htmlFor="" className='form-label'>Barcode</label>
//                                         <input
//                                          {
//                                             ...register('barcode',{
//                                                 required: 'bar field is required'
//                                             })
//                                         }
//                                         type="text" className='form-control' placeholder='Barcode'/>
//                                     </div>
//                                 </div>

//                             </div>
//                             <div className="row">
//                                 <div className="col-md-6">
//                                     <div className="mb-3">
//                                         <label htmlFor="" className='form-label'>Qty</label>
//                                         <input
//                                          {
//                                             ...register('qty',{
                                                
//                                             })
//                                         }
//                                         type="text" className='form-control' placeholder='Qty'/>
//                                     </div>
//                                 </div>
//                                <div className="col-md-6">
//                                     <div className="mb-3">
//                                         <label htmlFor="" className='form-label'>
//                                             Status
//                                         </label>
//                                         <select
//                                             {
//                                                 ...register('status',{
//                                                     required: 'Please select a status'
//                                                 })
//                                             }
//                                         className={`form-control ${errors.status ? 'is-invalid':''}`} 
//                                         >
//                                             <option value="">Select a Status</option>
//                                             <option value="1">Active</option>
//                                             <option value="0">Block</option>
//                                         </select>
//                                             {
//                                                 errors.status && <p className='invalid-feedback'>{errors.status.message}</p>
//                                             }
//                                     </div>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label htmlFor="" className='form-label'>
//                                         Featured
//                                     </label>
//                                     <select
//                                         {
//                                             ...register('is_featured',{
//                                                 required: 'Please select a featured'
//                                             })
//                                         }
//                                     className={`form-control ${errors.is_featured ? 'is-invalid':''}`} 
//                                     >
//                                        <option value="yes">Yes</option>
//                                         <option value="no">No</option>
//                                     </select>
//                                         {
//                                             errors.is_featured && <p className='invalid-feedback'>{errors.is_featured.message}</p>
//                                         }
//                                 </div>
//                             </div>
//                             <h3 className='py-3 border-bottom mb-3'>Gallery</h3>
//                             <div className="mb-3">
//                                 <label htmlFor="" className='form-label'>Image</label>
//                                 <input
//                                 onChange={handleFile}
//                                 type="file" className='form-control'/>
//                             </div> 

//                             <div className='mb-3'>
//                                 <div className="row">
//                                     {
//                                         galleryImages && galleryImages.map((image,index)=>{
//                                             return(
//                                                 <div className="col-md-3" key={`image-${index}`}>
//                                                     <div className="card shadow">
//                                                         <img src={image} alt="" className='w-100' />
//                                                         <button className='btn btn-danger' onClick={()=>deleteImage(image)}>Delete</button>
//                                                     </div>
//                                                 </div>
//                                             )
//                                         })
//                                     }
//                                 </div>
                                
//                             </div>                          

//                         </div>
//                     </div>

//                     <button className='btn btn-primary mt-3 mb-5' type='submit' disabled={disable}>Submit</button>
//                 </form>

//             </div>
//           </div>
//         </div>
//     </Layout>
//   );
    return (
        <Layout>
            <div className="container">
                <div className="row">
                    <div className="d-flex justify-content-between mt-5 pb-3">
                        <h4 className='h4 pb-0 mb-0'>Products / Create</h4>
                        <Link to="/admin/products" className='btn btn-primary'>Back</Link>
                    </div>
                    <div className="col-md-3">
                        <Sidebar/>
                    </div>
                    <div className="col-md-9">
                        <form onSubmit={handleSubmit(saveProduct)}>
                            <div className="card shadow">
                                <div className="card-body p-4">
                                    {/* ... other form fields remain the same ... */}

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
                            <h3 className='py-3 border-bottom mb-3'>Gallery</h3>
                            <div className="mb-3">
                                <label htmlFor="" className='form-label'>Image</label>
                                <input
                                onChange={handleFile}
                                type="file" className='form-control'/>
                            </div> 


                                    {/* exiting code  */}
                                    
                                    {/* Sizes Section */}
                                    <h3 className='py-3 border-bottom mb-3'>Sizes</h3>
                                    <div className="mb-3">
                                        {sizes && sizes.map((size) => (
                                            <div className="form-check form-check-inline" key={`size-${size.id}`}>
                                                <input 
                                                    {...register('sizes')}
                                                    className='form-check-input' 
                                                    type="checkbox" 
                                                    id={`size-${size.id}`} 
                                                    value={size.id}
                                                />
                                                <label htmlFor={`size-${size.id}`} className='form-check-label'>
                                                    {size.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Gallery Section */}
                                    <h3 className='py-3 border-bottom mb-3'>Gallery</h3>
                                    <div className="mb-3">
                                        <label htmlFor="" className='form-label'>Image</label>
                                        <input
                                            onChange={handleFile}
                                            type="file" 
                                            className='form-control'
                                            accept="image/*"
                                            disabled={disable}
                                        />
                                        <small className="text-muted">First image will be set as primary</small>
                                    </div> 

                                    <div className='mb-3'>
                                        <div className="row">
                                            {galleryImages.map((image, index) => (
                                                <div className="col-md-3 mb-3" key={`image-${image.id}`}>
                                                    <div className="card shadow">
                                                        <img src={image.image_url} alt="" className='w-100' style={{height: '150px', objectFit: 'cover'}} />
                                                        <div className="card-body p-2">
                                                            <small className="d-block text-center">{index === 0 ? 'Primary' : ''}</small>
                                                            <button 
                                                                type="button"
                                                                className='btn btn-danger btn-sm w-100 mt-1'
                                                                onClick={() => deleteImage(image)}
                                                                disabled={disable}
                                                            >
                                                                Delete
                                                            </button>
                                                            {index !== 0 && (
                                                                <button 
                                                                    type="button"
                                                                    className='btn btn-warning btn-sm w-100 mt-1'
                                                                    onClick={() => setPrimaryImage(image)}
                                                                    disabled={disable}
                                                                >
                                                                    Set Primary
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>                          
                                </div>
                            </div>
                            <button className='btn btn-primary mt-3 mb-5' type='submit' disabled={disable}>
                                {disable ? 'Saving...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );

}


export default Create;

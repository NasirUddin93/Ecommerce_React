<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSize;
use App\Models\TempImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator as FacadesValidator;
use Illuminate\Validation\Validator;
use Illuminate\Support\Facades\Log; // Add this import for logging
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProductController extends Controller
{
    public function index(){
        $products = Product::orderBy('created_at','DESC')
            ->with(['product_images','product_sizes'])
            ->get();
        return response()->json([
            'status'=>200,
            'data'=>$products
        ],200);
    }

    public function store(Request $request){
        $validator = FacadesValidator::make($request->all(), [
            'title' => 'required|string',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'sku' => 'required|string|unique:products,sku',
            'status' => 'required|in:0,1',
            'is_featured' => 'required|in:yes,no'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ], 400);
        }

        // $product = Product::create($request->all());
        $product = new Product();
        $product->title = $request->title;
        $product->price = $request->price;
        $product->compare_price = $request->compare_price;
        $product->category_id = $request->category_id;
        $product->brand_id = $request->brand_id;
        $product->sku = $request->sku;
        $product->qty = $request->qty;
        $product->description = $request->description;
        $product->short_description = $request->short_description;
        $product->status = $request->status;
        $product->is_featured = $request->is_featured;
        $product->barcode = $request->barcode;
        $product->save();

        // dd($request->gallery);

        if(!empty($request->gallery)){
            foreach($request->gallery as $key => $tempImageId){
                $tempImage = TempImage::find($tempImageId);
                $extArray = explode('.',$tempImage->name);
                $ext = end($extArray);

                // large image
                $imageName =$product->id.'_'.time().'.'.$ext;   // 3435454645.jpg
                $manager = new ImageManager(Driver::class);
                $img = $manager->read(public_path('uploads/temp/'.$tempImage->name));
                $img->scaleDown(1200);
                $img->save(public_path('uploads/products/large/'.$imageName));

                // Small Thumbnail
                $manager = new ImageManager(Driver::class);
                $img = $manager->read(public_path('uploads/temp/'.$tempImage->name));
                $img->coverDown(400,460);
                $img->save(public_path('uploads/products/small/'.$imageName));


                $productImage = new ProductImage();
                $productImage->image = $imageName;
                $productImage->product_id = $product->id;
                $productImage->save();


                if($key == 0){
                    $product->image = $imageName;
                    $product->save();
                }


            }
        }

        return response()->json([
            'status' => 200,
            'message' => 'Product created successfully'
        ], 200);

    }
    // Show single product
    public function show($id){
        $product = Product::with(['product_images','product_sizes'])->find($id);
        if($product == null){
            return response()->json([
                'status' => 400,
                'message' => 'Product not found'
            ], 400);
        }

        $productSizes = $product->product_sizes->pluck('size_id');

        return response()->json([
            'status' => 200,
            'data' => $product,
            'product_sizes' => $productSizes
        ], 200);

    }

    // Update the product
    // public function Update($id, Request $request){
    //     $product = Product::find($id);
    //     if($product == null){
    //         return response()->json([
    //             'status' => 400,
    //             'message' => 'Product not found'
    //         ], 400);

    //     }

    //     $validator = FacadesValidator::make($request->all(), [
    //         'title' => 'required|string',
    //         'price' => 'required|numeric',
    //         'category_id' => 'required|exists:categories,id',
    //         'brand_id' => 'required|exists:brands,id',
    //         'sku' => 'required|string|unique:products,sku,' . $id . ',id',
    //         'is_featured' => 'required|in:yes,no',
    //         'status' => 'required|in:0,1'
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'status' => 400,
    //             'errors' => $validator->errors()
    //         ], 400);
    //     }

    //     // Update the product to database

    //     $product->title = $request->title;
    //     $product->price = $request->price;
    //     $product->compare_price = $request->compare_price;
    //     $product->category_id = $request->category_id;
    //     $product->brand_id = $request->brand_id;
    //     $product->sku = $request->sku;
    //     $product->qty = $request->qty;
    //     $product->description = $request->description;
    //     $product->short_description = $request->short_description;
    //     $product->status = $request->status;
    //     $product->is_featured = $request->is_featured;
    //     $product->barcode = $request->barcode;
    //     $product->save();

    //     if(!empty($request->sizes)){
    //         // Delete existing sizes
    //         ProductSize::where('product_id',$product->id)->delete();
    //         foreach($request->sizes as $sizeId){
    //             $productSize = new ProductSize();
    //             $productSize->size_id = $sizeId;
    //             $productSize->product_id = $product->id;
    //             $productSize->save();
    //         }
    //     }


    //     return response()->json([
    //         'status' => 200,
    //         'message' => 'Product updated successfully'
    //     ], 200);

    // }
// public function Update($id, Request $request){
//     $product = Product::find($id);
//     if($product == null){
//         return response()->json([
//             'status' => 400,
//             'message' => 'Product not found'
//         ], 400);
//     }

//     Log::info('Updating product ID: ' . $id);
//     Log::info('Request SKU: ' . $request->sku);
//     Log::info('Current Product SKU: ' . $product->sku);

//     $validator = FacadesValidator::make($request->all(), [
//         'title' => 'required|string',
//         'price' => 'required|numeric',
//         'category_id' => 'required|exists:categories,id',
//         'brand_id' => 'required|exists:brands,id',
//         'sku' => 'required|string|unique:products,sku,' . $id . ',id',
//         'is_featured' => 'required|in:yes,no',
//         'status' => 'required|in:0,1'
//     ]);

//     if ($validator->fails()) {
//         Log::info('Validation failed: ', $validator->errors()->toArray());
//         return response()->json([
//             'status' => 400,
//             'errors' => $validator->errors()
//         ], 400);
//     }

//     // Rest of your update logic...
// }

    public function update($id, Request $request){
        $product = Product::find($id);
        if($product == null){
            return response()->json([
                'status' => 400,
                'message' => 'Product not found'
            ], 400);
        }

        $validator = FacadesValidator::make($request->all(), [
            'title' => 'required|string',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'sku' => 'required|string|unique:products,sku,' . $id . ',id',
            'is_featured' => 'required|in:yes,no',
            'status' => 'required|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ], 400);
        }

        // Update the product
        $product->title = $request->title;
        $product->price = $request->price;
        $product->compare_price = $request->compare_price;
        $product->category_id = $request->category_id;
        $product->brand_id = $request->brand_id;
        $product->sku = $request->sku;
        $product->qty = $request->qty;
        $product->description = $request->description;
        $product->short_description = $request->short_description;
        $product->status = $request->status;
        $product->is_featured = $request->is_featured;
        $product->barcode = $request->barcode;
        $product->save();

        // Handle sizes
        if(!empty($request->sizes)){
            // Delete existing sizes
            ProductSize::where('product_id', $product->id)->delete();
            foreach($request->sizes as $sizeId){
                $productSize = new ProductSize();
                $productSize->size_id = $sizeId;
                $productSize->product_id = $product->id;
                $productSize->save();
            }
        }

        return response()->json([
            'status' => 200,
            'message' => 'Product updated successfully'
        ], 200);
    }



    public function destroy($id){
        $product = Product::find($id);
        if($product == null){
            return response()->json([
                'status' => 400,
                'message' => 'Product not found'
            ], 400);
        }
        $product->delete();
        return response()->json([
            'status' => 200,
            'message' => 'Product has been deleted successfully'
        ], 200);
    }

    public function saveProductImage(Request $request){
           $validator = FacadesValidator::make($request->all(), [
            'image' => 'required|image|mimes:png,jpg,jpeg,gif',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ], 400);
        }

        $image = $request->file('image');
        $imageName = $request->product_id.'-'.time().'.'.$image->extension();


        // large image
        $manager = new ImageManager(Driver::class);
        $img = $manager->read($image->getPathName());
        $img->scaleDown(1200);
        $img->save(public_path('uploads/products/large/'.$imageName));

        // Small Thumbnail
        $manager = new ImageManager(Driver::class);
        $img = $manager->read($image->getPathName());
        $img->coverDown(400,460);
        $img->save(public_path('uploads/products/small/'.$imageName));



        // Save image thumbnail
        $manager = new ImageManager(Driver::class);
        $img = $manager->read(public_path('uploads/temp/'.$imageName));
        $img->coverDown(400,450);
        $img->save(public_path('uploads/temp/thumb/'.$imageName));

        //Insert a record in product_images table
        $productImage = new ProductImage();
        $productImage->image = $imageName;
        $productImage->product_id = $request->id;
        $productImage->save();

        return response()->json([
            'status' => 200,
            'message' => 'Product created successfully'
        ], 200);

    }

    public function updateDefaultImage(Request $request){
        $product = Product::find($request->product_id);
        // dd($request->all());
        $product->image = $request->image;
        $product->save();

        return response()->json([
            'status'=>200,
            'message'=>"Product default image changed successfully"
        ],200);
    }


}

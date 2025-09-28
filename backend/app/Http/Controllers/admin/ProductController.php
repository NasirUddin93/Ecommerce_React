<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\TempImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator as FacadesValidator;
use Illuminate\Validation\Validator;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProductController extends Controller
{
    public function index(){
        $products = Product::orderBy('created_at','DESC')->get();
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
            'sku' => 'required|string',
            'status' => 'required|in:0,1',
            'is_featured' => 'required|in:yes,no'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ], 400);
        }

        $product = Product::create($request->all());

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
        $product = Product::find($id);
        if($product == null){
            return response()->json([
                'status' => 400,
                'message' => 'Product not found'
            ], 400);
        }

        return response()->json([
            'status' => 200,
            'data' => $product
        ], 200);

    }

    // Update the product
    public function Update($id, Request $request){
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
            'sku' => 'required|unique:products,sku,'.$id.',id',
            'is_featured' => 'required|in:yes,no',
            'status' => 'required|in:0,1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ], 400);
        }

        // Store the product to database

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
        $product->update();

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


}

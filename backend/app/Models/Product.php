<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'title',
        'price',
        'compare_price',
        'category_id',
        'brand_id',
        'sku',
        'qty',
        'description',
        'short_description',
        'status',
        'is_featured',
        'barcode',
        'image'
    ];

    // One product has many images
    public function gallery(){
        return $this->hasMany(ProductImage::class,'product_id','id');
    }

}

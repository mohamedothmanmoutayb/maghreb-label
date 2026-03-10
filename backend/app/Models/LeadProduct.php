<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LeadProduct extends Model {
    public $timestamps=false;
    protected $fillable=['lead_id','product_id','price','quantity'];
    public function product(){return $this->belongsTo(Product::class);}
}

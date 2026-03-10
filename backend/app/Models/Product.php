<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Product extends Model {
    protected $fillable=['category_id','nom','prix_unitaire','delai_production','ingredient','description','image','statut'];
    public function category(){return $this->belongsTo(Category::class);}
}

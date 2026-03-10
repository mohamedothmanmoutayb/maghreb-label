<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class RequestLabel extends Model {
    protected $table='requests';
    protected $fillable=['user_id','product_id','fichier_label','statut_validation','notes'];
    public function user(){return $this->belongsTo(User::class);}
    public function product(){return $this->belongsTo(Product::class);}
}

<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ShippingStatus extends Model {
    protected $fillable=['lead_id','statut','tracking_number'];
    public function lead(){return $this->belongsTo(Lead::class);}
}

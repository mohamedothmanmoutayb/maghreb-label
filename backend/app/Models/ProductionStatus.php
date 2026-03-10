<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ProductionStatus extends Model {
    protected $fillable=['lead_id','statut'];
    public function lead(){return $this->belongsTo(Lead::class);}
}

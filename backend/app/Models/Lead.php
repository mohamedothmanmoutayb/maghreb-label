<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Lead extends Model {
    protected $fillable=['user_id','client_id','last_mile_integration_id','n_lead','quantite_total','total','statut_confirmation','status_shipping','notes'];
    public function user(){return $this->belongsTo(User::class);}
    public function client(){return $this->belongsTo(Client::class);}
    public function products(){return $this->hasMany(LeadProduct::class);}
    public function histories(){return $this->hasMany(LeadHistory::class)->latest();}
    public function productionStatus(){return $this->hasOne(ProductionStatus::class);}
    public function printStatus(){return $this->hasOne(PrintStatus::class);}
    public function shippingStatus(){return $this->hasOne(ShippingStatus::class);}
}

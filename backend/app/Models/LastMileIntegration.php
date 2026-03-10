<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LastMileIntegration extends Model {
    protected $fillable=['user_id','last_mile_id','auth_type','api_key','api_secret','config','is_active'];
    public function user(){return $this->belongsTo(User::class);}
    public function lastMile(){return $this->belongsTo(LastMile::class);}
}

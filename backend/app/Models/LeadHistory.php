<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LeadHistory extends Model {
    protected $fillable=['lead_id','user_id','status','note'];
    public function user(){return $this->belongsTo(User::class);}
}

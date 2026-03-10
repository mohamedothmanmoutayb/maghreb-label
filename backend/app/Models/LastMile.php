<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class LastMile extends Model {
    protected $fillable=['name','logo','description','is_active'];
    public function integrations(){return $this->hasMany(LastMileIntegration::class);}
}

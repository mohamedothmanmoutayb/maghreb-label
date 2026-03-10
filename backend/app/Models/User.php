<?php
namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject {
    protected $fillable = ['nom','email','telephone','mot_de_passe','role','statut','email_verified','otp_code','otp_expires','reset_token','reset_expires'];
    protected $hidden = ['mot_de_passe','otp_code','reset_token'];
    protected $casts = ['email_verified'=>'boolean'];
    public function getAuthPassword() { return $this->mot_de_passe; }
    public function getJWTIdentifier() { return $this->getKey(); }
    public function getJWTCustomClaims() { return ['role'=>$this->role,'nom'=>$this->nom]; }
    public function wallet() { return $this->hasOne(Wallet::class); }
    public function leads() { return $this->hasMany(Lead::class); }
    public function clients() { return $this->hasMany(Client::class); }
}

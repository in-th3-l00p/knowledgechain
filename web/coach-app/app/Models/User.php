<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function coachProfile()
    {
        return $this->hasOne(CoachProfile::class);
    }

    public function sessions()
    {
        return $this->hasMany(Session::class, 'student_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'student_id');
    }

    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function recommendations()
    {
        return $this->hasMany(CoachRecommendation::class);
    }

    public function availabilities()
    {
        return $this->hasMany(Availability::class);
    }

    public function isCoach()
    {
        return $this->user_type === 'coach';
    }

    public function isStudent()
    {
        return $this->user_type === 'student';
    }
}

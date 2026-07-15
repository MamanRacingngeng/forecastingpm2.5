<?php

use App\Http\Controllers\Pm25Controller;
use Illuminate\Support\Facades\Route;

Route::get('/', [Pm25Controller::class, 'index'])->name('home');
Route::get('/api/predict', [Pm25Controller::class, 'predict'])->name('api.predict');
Route::get('/api/refresh', [Pm25Controller::class, 'refresh'])->name('api.refresh');
Route::get('/api/countries', [Pm25Controller::class, 'countries'])->name('api.countries');
Route::get('/api/cities', [Pm25Controller::class, 'cities'])->name('api.cities');
Route::get('/api/years', [Pm25Controller::class, 'years'])->name('api.years');
Route::get('/api/overview', [Pm25Controller::class, 'overview'])->name('api.overview');
Route::post('/api/user-predict', [Pm25Controller::class, 'userPredict'])->name('api.user-predict');

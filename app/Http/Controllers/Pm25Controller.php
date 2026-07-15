<?php

namespace App\Http\Controllers;

use App\Services\MlPredictionService;
use App\Services\UserPredictionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class Pm25Controller extends Controller
{
    public function __construct(
        private MlPredictionService $mlService,
        private UserPredictionService $userService,
    ) {}

    public function index(): View
    {
        return view('pm25.index');
    }

    public function predict(): JsonResponse
    {
        try {
            $data = $this->mlService->getResults();

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function refresh(): JsonResponse
    {
        try {
            $data = $this->mlService->getResults(refresh: true);

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Model berhasil dilatih ulang',
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function countries(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => ['countries' => $this->userService->getCountries()],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function years(Request $request): JsonResponse
    {
        $request->validate([
            'country' => 'required|string',
            'city' => 'required|string',
        ]);

        try {
            return response()->json([
                'success' => true,
                'data' => ['years' => $this->userService->getYears($request->country, $request->city)],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function cities(Request $request): JsonResponse
    {
        $request->validate(['country' => 'required|string']);

        try {
            return response()->json([
                'success' => true,
                'data' => ['cities' => $this->userService->getCities($request->country)],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function overview(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'overview' => $this->userService->getOverview(),
                    'model_accuracy' => $this->userService->getModelAccuracy(),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function userPredict(Request $request): JsonResponse
    {
        $request->validate([
            'country' => 'required|string',
            'city' => 'required|string',
            'year' => 'required|integer',
        ]);

        @set_time_limit(210);

        try {
            $data = $this->userService->predict($request->country, $request->city, (int) $request->year);

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}

<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use RuntimeException;

class MlPredictionService
{
    private const CACHE_KEY = 'pm25_predictions';
    private const CACHE_TTL = 3600;

    public function __construct(private ModelMetricsService $metricsService) {}

    public function getResults(bool $refresh = false): array
    {
        if ($refresh) {
            Cache::forget(self::CACHE_KEY);

            return $this->metricsService->applyResearchMetrics($this->runPythonModels(force: true));
        }

        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return $this->metricsService->applyResearchMetrics($this->runPythonModels());
        });
    }

    private function runPythonModels(bool $force = false): array
    {
        $jsonPath = storage_path('app/predictions.json');

        if (! $force && File::exists($jsonPath)) {
            $cached = json_decode(File::get($jsonPath), true);
            if (is_array($cached) && isset($cached['models'])) {
                return $cached;
            }
        }

        $python = config('pm25.python_path');
        $script = base_path('ml/lstm_engine.py');

        if (! File::exists($script)) {
            throw new RuntimeException('Script ML tidak ditemukan: ml/lstm_engine.py');
        }

        if (! File::exists(base_path('data/global_air_quality.csv')) && ! $this->hasAnyDataset()) {
            throw new RuntimeException('Dataset tidak ditemukan. Taruh file CSV di folder data/');
        }

        $result = Process::timeout(600)->run([
            $python,
            $script,
        ]);

        if (! $result->successful()) {
            throw new RuntimeException('Gagal menjalankan model Python: '.$result->errorOutput());
        }

        $jsonPath = storage_path('app/predictions.json');
        if (! File::exists($jsonPath)) {
            throw new RuntimeException('File hasil prediksi tidak ditemukan.');
        }

        $data = json_decode(File::get($jsonPath), true);
        if (! is_array($data)) {
            throw new RuntimeException('Format hasil prediksi tidak valid.');
        }

        return $data;
    }

    private function hasAnyDataset(): bool
    {
        $dataDir = base_path('data');
        if (! File::isDirectory($dataDir)) {
            return false;
        }

        return count(File::glob($dataDir.'/*.csv')) > 0;
    }
}

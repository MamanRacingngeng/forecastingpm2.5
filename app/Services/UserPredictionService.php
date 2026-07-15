<?php



namespace App\Services;



use Illuminate\Support\Facades\Cache;

use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Process;

use RuntimeException;



class UserPredictionService

{

    private const CACHE_TTL = 3600;



    private const PYTHON_TIMEOUT = 180;



    public function __construct(

        private AirQualityDataService $dataService,

        private ModelMetricsService $metricsService,

    ) {}



    public function getCountries(): array

    {

        return $this->dataService->getCountries();

    }



    public function getCities(string $country): array

    {

        return $this->dataService->getCities($country);

    }



    public function getYears(string $country, string $city): array

    {

        return $this->dataService->getYears($country, $city);

    }



    public function getOverview(): array

    {

        return $this->dataService->getOverview();

    }



    public function getModelAccuracy(): array

    {

        return $this->metricsService->getScaAccuracy();

    }



    public function predict(string $country, string $city, int $year): array

    {

        @set_time_limit(self::PYTHON_TIMEOUT + 30);



        $cacheKey = 'user_predict_'.md5("{$country}|{$city}|{$year}");



        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($country, $city, $year) {

            try {

                $result = $this->runPythonPredict($country, $city, $year);

            } catch (\Throwable $e) {

                Log::warning('Prediksi Python gagal, memakai fallback', [

                    'country' => $country,

                    'city' => $city,

                    'year' => $year,

                    'error' => $e->getMessage(),

                ]);

                $result = $this->fallbackPredict($country, $city, $year);

            }



            return $this->enrichResult($result, $country, $city, $year);

        });

    }



    private function enrichResult(array $result, string $country, string $city, int $year): array

    {

        $years = $this->dataService->getYears($country, $city);

        $yearMeta = collect($years)->firstWhere('year', $year) ?? ['type' => 'forecast', 'label' => (string) $year];

        $stats = $this->dataService->getLocationStats($country, $city, $year);



        $result['year_type'] = $yearMeta['type'];

        $result['year_label'] = $yearMeta['label'];

        $result['historical_avg'] = $stats['avg_pm25'];

        $result['data_points'] = $stats['data_points'];

        $result['min_pm25'] = $stats['min_pm25'];

        $result['max_pm25'] = $stats['max_pm25'];



        if ($yearMeta['type'] === 'forecast') {

            $result['prediction_note'] = 'Estimasi berdasarkan pola data historis di lokasi ini.';

        } else {

            $result['prediction_note'] = 'Estimasi untuk tahun '.$year.' berdasarkan data historis sebelumnya.';

        }



        return $result;

    }



    private function runPythonPredict(string $country, string $city, int $year): array

    {

        $python = config('pm25.python_path');

        $script = base_path('ml/predict_user.py');



        if (! is_file($python)) {

            throw new RuntimeException('Python tidak ditemukan di: '.$python);

        }



        $result = Process::timeout(self::PYTHON_TIMEOUT)

            ->path(base_path('ml'))

            ->env([

                'TF_CPP_MIN_LOG_LEVEL' => '3',

                'TF_ENABLE_ONEDNN_OPTS' => '0',

                'PYTHONIOENCODING' => 'utf-8',

            ])

            ->run([

                $python, $script,

                '--action', 'predict',

                '--country', $country,

                '--city', $city,

                '--year', (string) $year,

            ]);



        if (! $result->successful()) {

            throw new RuntimeException(trim($result->errorOutput() ?: $result->output() ?: 'Proses Python gagal.'));

        }



        $json = $this->parsePythonJson($result->output());

        if (! is_array($json) || ! ($json['success'] ?? false)) {

            throw new RuntimeException($json['error'] ?? 'Respons prediksi tidak valid.');

        }



        return $json['data'];

    }



    private function parsePythonJson(string $output): ?array

    {

        $output = trim($output);

        if ($output === '') {

            return null;

        }



        $decoded = json_decode($output, true);

        if (is_array($decoded)) {

            return $decoded;

        }



        if (preg_match('/\{"success"\s*:\s*true.*\}$/s', $output, $matches)) {

            $decoded = json_decode($matches[0], true);

            if (is_array($decoded)) {

                return $decoded;

            }

        }



        $lines = array_reverse(array_filter(array_map('trim', explode("\n", $output))));

        foreach ($lines as $line) {

            if (! str_starts_with($line, '{')) {

                continue;

            }

            $decoded = json_decode($line, true);

            if (is_array($decoded)) {

                return $decoded;

            }

        }



        return null;

    }



    private function fallbackPredict(string $country, string $city, int $year): array

    {

        $series = $this->dataService->getSeriesForPrediction($country, $city, $year);

        $timesteps = (int) config('pm25.model.timesteps', 10);



        if (count($series) < $timesteps + 1) {

            throw new RuntimeException('Data historis tidak cukup untuk prediksi lokasi ini.');

        }



        $window = array_slice($series, -$timesteps);

        $weights = range(1, $timesteps);

        $weighted = 0;

        foreach ($window as $i => $value) {

            $weighted += $value * $weights[$i];

        }



        $prediction = round($weighted / array_sum($weights), 1);

        $category = $this->pm25Category($prediction);



        return [

            'country' => $country,

            'city' => $city,

            'year' => $year,

            'prediction' => $prediction,

            'unit' => 'µg/m³',

            'status' => $category['label'],

            'emoji' => $category['emoji'],

            'color' => $category['color'],

            'message' => $category['message'],

            'mode' => 'fallback',

        ];

    }



    private function pm25Category(float $value): array

    {

        if ($value <= 12) {

            return ['label' => 'Baik', 'emoji' => '🟢', 'color' => 'good', 'message' => 'Udara dalam kondisi baik dan aman untuk seluruh aktivitas luar ruangan.'];

        }

        if ($value <= 35) {

            return ['label' => 'Sedang', 'emoji' => '🟡', 'color' => 'moderate', 'message' => 'Kualitas udara dapat diterima. Kelompok sensitif sebaiknya membatasi aktivitas luar ruangan yang lama.'];

        }

        if ($value <= 55) {

            return ['label' => 'Tidak Sehat', 'emoji' => '🟠', 'color' => 'unhealthy', 'message' => 'Anggota kelompok sensitif dapat mengalami dampak kesehatan. Kurangi aktivitas di luar ruangan.'];

        }



        return ['label' => 'Sangat Tidak Sehat', 'emoji' => '🔴', 'color' => 'very-unhealthy', 'message' => 'Semua orang berisiko terkena dampak kesehatan. Hindari aktivitas luar ruangan.'];

    }

}



<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use RuntimeException;

class AirQualityDataService
{
    private ?array $rows = null;

    public function getOverview(): array
    {
        $rows = $this->getRows();
        $years = collect($rows)->map(fn ($r) => (int) substr($r['Date'], 0, 4))->unique()->sort()->values();
        $dates = collect($rows)
            ->pluck('Date')
            ->map(fn ($date) => substr($date, 0, 10))
            ->sort()
            ->values();

        return [
            'total_records' => count($rows),
            'countries' => count($this->getCountries()),
            'cities' => collect($rows)
                ->map(fn ($row) => $row['Country'].'|'.$row['City'])
                ->unique()
                ->count(),
            'years_available' => $years->all(),
            'date_range' => $dates->isEmpty()
                ? '-'
                : $this->formatDateIndonesian($dates->first()).' – '.$this->formatDateIndonesian($dates->last()),
            'dataset_file' => File::exists(base_path('data/pm25.csv'))
                ? 'pm25.csv + global_air_quality.csv'
                : 'global_air_quality.csv',
        ];
    }

    private function pm25SeriesExists(): bool
    {
        return File::exists(base_path('data/pm25.csv'));
    }

    private function getPm25SeriesRows(): array
    {
        static $rows = null;
        if ($rows !== null) {
            return $rows;
        }

        $path = base_path('data/pm25.csv');
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);
        $rows = [];

        while (($data = fgetcsv($handle)) !== false) {
            $rows[] = array_combine($header, $data);
        }

        fclose($handle);

        return $rows;
    }

    private function getPm25SeriesYears(): array
    {
        $years = collect($this->getPm25SeriesRows())
            ->map(fn ($row) => (int) substr($row['datetime'], 0, 4))
            ->unique()
            ->sort()
            ->values();

        $result = $years->map(fn ($y) => [
            'year' => $y,
            'type' => 'historical',
            'label' => "{$y} — Data Historis",
        ])->all();

        $forecastYear = $years->max() + 1;
        $result[] = [
            'year' => $forecastYear,
            'type' => 'forecast',
            'label' => "{$forecastYear} — Prediksi Forecast",
        ];

        return $result;
    }

    private function getPm25SeriesStats(int $year): array
    {
        $values = collect($this->getPm25SeriesRows())
            ->filter(fn ($row) => (int) substr($row['datetime'], 0, 4) === $year)
            ->pluck('PM2.5')
            ->map(fn ($v) => (float) $v);

        if ($values->isEmpty()) {
            $values = collect($this->getPm25SeriesRows())
                ->pluck('PM2.5')
                ->map(fn ($v) => (float) $v);
        }

        return [
            'data_points' => $values->count(),
            'avg_pm25' => round($values->avg(), 1),
            'min_pm25' => round($values->min(), 1),
            'max_pm25' => round($values->max(), 1),
        ];
    }

    private function getPm25SeriesForPrediction(int $year): array
    {
        $rows = collect($this->getPm25SeriesRows())
            ->sortBy('datetime')
            ->values();

        $availableYears = $rows
            ->map(fn ($row) => (int) substr($row['datetime'], 0, 4))
            ->unique()
            ->sort()
            ->values();

        $series = $rows->pluck('PM2.5')->map(fn ($v) => (float) $v)->all();

        if ($year > $availableYears->max()) {
            return $series;
        }

        $prior = $rows
            ->filter(fn ($row) => (int) substr($row['datetime'], 0, 4) < $year)
            ->pluck('PM2.5')
            ->map(fn ($v) => (float) $v)
            ->all();

        if (count($prior) >= 15) {
            return $prior;
        }

        $yearVals = $rows
            ->filter(fn ($row) => (int) substr($row['datetime'], 0, 4) === $year)
            ->pluck('PM2.5')
            ->map(fn ($v) => (float) $v)
            ->all();

        $split = max((int) (count($yearVals) * 0.8), 15);

        return array_slice($yearVals, 0, $split);
    }

    public function getCountries(): array
    {
        $countries = collect($this->getRows())
            ->pluck('Country')
            ->unique()
            ->sort()
            ->values()
            ->all();

        if (! in_array('Indonesia', $countries, true)) {
            array_unshift($countries, 'Indonesia');
        }

        return $countries;
    }

    public function getCities(string $country): array
    {
        if ($country === 'Indonesia') {
            return ['Jakarta'];
        }

        return collect($this->getRows())
            ->filter(fn ($row) => $row['Country'] === $country)
            ->pluck('City')
            ->unique()
            ->sort()
            ->values()
            ->all();
    }

    public function getYears(string $country, string $city): array
    {
        if ($country === 'Indonesia' && $city === 'Jakarta' && $this->pm25SeriesExists()) {
            return $this->getPm25SeriesYears();
        }

        $years = collect($this->getRows())
            ->filter(fn ($row) => $row['Country'] === $country && $row['City'] === $city)
            ->map(fn ($row) => (int) substr($row['Date'], 0, 4))
            ->unique()
            ->sort()
            ->values();

        $result = $years->map(fn ($y) => [
            'year' => $y,
            'type' => 'historical',
            'label' => "{$y} — Data Historis (Dataset)",
        ])->all();

        $maxYear = $years->max();
        $forecastYear = $maxYear + 1;

        $result[] = [
            'year' => $forecastYear,
            'type' => 'forecast',
            'label' => "{$forecastYear} — Prediksi Forecast",
        ];

        return $result;
    }

    public function getLocationStats(string $country, string $city, int $year): array
    {
        if ($country === 'Indonesia' && $city === 'Jakarta' && $this->pm25SeriesExists()) {
            return $this->getPm25SeriesStats($year);
        }

        $values = collect($this->getRows())
            ->filter(fn ($row) => $row['Country'] === $country
                && $row['City'] === $city
                && (int) substr($row['Date'], 0, 4) === $year)
            ->pluck('PM2.5')
            ->map(fn ($v) => (float) $v);

        if ($values->isEmpty()) {
            $allValues = collect($this->getRows())
                ->filter(fn ($row) => $row['Country'] === $country && $row['City'] === $city)
                ->pluck('PM2.5')
                ->map(fn ($v) => (float) $v);

            return [
                'data_points' => $allValues->count(),
                'avg_pm25' => round($allValues->avg(), 1),
                'min_pm25' => round($allValues->min(), 1),
                'max_pm25' => round($allValues->max(), 1),
            ];
        }

        return [
            'data_points' => $values->count(),
            'avg_pm25' => round($values->avg(), 1),
            'min_pm25' => round($values->min(), 1),
            'max_pm25' => round($values->max(), 1),
        ];
    }

    public function getSeriesForPrediction(string $country, string $city, int $year): array
    {
        if ($country === 'Indonesia' && $city === 'Jakarta' && $this->pm25SeriesExists()) {
            return $this->getPm25SeriesForPrediction($year);
        }

        $daily = [];
        foreach ($this->getRows() as $row) {
            if ($row['Country'] !== $country || $row['City'] !== $city) {
                continue;
            }
            $date = substr($row['Date'], 0, 10);
            $daily[$date][] = (float) $row['PM2.5'];
        }

        ksort($daily);
        $availableYears = array_unique(array_map(fn ($d) => (int) substr($d, 0, 4), array_keys($daily)));
        $maxYear = max($availableYears);

        if ($year > $maxYear) {
            return array_map(fn ($vals) => array_sum($vals) / count($vals), array_values($daily));
        }

        $prior = [];
        foreach ($daily as $date => $vals) {
            if ((int) substr($date, 0, 4) < $year) {
                $prior[] = array_sum($vals) / count($vals);
            }
        }

        if (count($prior) >= 15) {
            return $prior;
        }

        $yearVals = [];
        foreach ($daily as $date => $vals) {
            if ((int) substr($date, 0, 4) === $year) {
                $yearVals[] = array_sum($vals) / count($vals);
            }
        }

        $split = max((int) (count($yearVals) * 0.8), 15);

        return array_slice($yearVals, 0, $split);
    }

    private function formatDateIndonesian(string $date): string
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        $timestamp = strtotime($date);
        $day = (int) date('j', $timestamp);
        $month = $months[(int) date('n', $timestamp)];
        $year = date('Y', $timestamp);

        return "{$day} {$month} {$year}";
    }

    private function getRows(): array
    {
        if ($this->rows !== null) {
            return $this->rows;
        }

        $path = base_path('data/global_air_quality.csv');
        if (! File::exists($path)) {
            throw new RuntimeException('Dataset tidak ditemukan.');
        }

        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);
        $rows = [];

        while (($data = fgetcsv($handle)) !== false) {
            $rows[] = array_combine($header, $data);
        }

        fclose($handle);
        $this->rows = $rows;

        return $this->rows;
    }
}

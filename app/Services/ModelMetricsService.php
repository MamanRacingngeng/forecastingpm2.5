<?php

namespace App\Services;

class ModelMetricsService
{
    public function getResearchMetrics(): array
    {
        return config('pm25.research_metrics');
    }

    public function getScaAccuracy(): array
    {
        $sca = config('pm25.research_metrics.sca_lstm');

        return [
            'model' => 'SCA-LSTM',
            'rmse' => $sca['metrics']['rmse'],
            'mape' => $sca['metrics']['mape'],
            'r2' => $sca['metrics']['r2'],
            'params' => $sca['params'],
            'note' => 'Hasil evaluasi penelitian — akurasi terbaik dari 3 model',
        ];
    }

    public function applyResearchMetrics(array $data): array
    {
        $research = $this->getResearchMetrics();

        foreach (['default', 'grid_search', 'sca_lstm'] as $key) {
            if (! isset($data['models'][$key])) {
                continue;
            }
            $data['models'][$key]['name'] = $research[$key]['name'];
            $data['models'][$key]['params'] = $research[$key]['params'];
            $data['models'][$key]['metrics'] = $research[$key]['metrics'];
        }

        $data['metrics_source'] = 'penelitian';

        return $data;
    }
}

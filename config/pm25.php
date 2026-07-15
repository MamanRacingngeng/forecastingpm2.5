<?php



return [

    'python_path' => env('PYTHON_PATH', 'C:\\Users\\ACER\\anaconda3\\python.exe'),



    /*

    |--------------------------------------------------------------------------

    | Model SCA-LSTM (hasil tuning terbaru)

    |--------------------------------------------------------------------------

    */

    'model' => [

        'timesteps' => 10,

        'sca_lstm' => [

            'units' => 98,

            'lr' => 0.009125,

            'epochs' => 24,

            'batch_size' => 8,

        ],

        'dataset_pm25' => 'pm25.csv',

        'dataset_global' => 'global_air_quality.csv',

    ],



    /*

    |--------------------------------------------------------------------------

    | Metrik evaluasi model (notebook terbaru)

    |--------------------------------------------------------------------------

    */

    'research_metrics' => [

        'default' => [

            'name' => 'LSTM Default',

            'params' => ['units' => 50, 'lr' => 0.001, 'epochs' => 20, 'batch_size' => 16],

            'metrics' => ['rmse' => 0.1175, 'mape' => 1.1031, 'r2' => 0.9728],

        ],

        'grid_search' => [

            'name' => 'Grid Search LSTM',

            'params' => ['units' => 32, 'lr' => 0.005, 'epochs' => 20, 'batch_size' => 32],

            'metrics' => ['rmse' => 0.1157, 'mape' => 1.2679, 'r2' => 0.9736],

        ],

        'sca_lstm' => [

            'name' => 'SCA-LSTM',

            'params' => ['units' => 98, 'lr' => 0.009125, 'epochs' => 24, 'batch_size' => 8],

            'metrics' => ['rmse' => 0.1130, 'mape' => 1.1907, 'r2' => 0.9748],

        ],

    ],

];


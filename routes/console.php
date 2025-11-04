<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Process\Process;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('lint {--test : Check for errors without modifying files} {--dirty : Check only modified files}', function () {
    // Comando original ./vendor/bin/pint
    $command = [base_path('vendor/bin/pint')];

    // Crea un proceso para ejecutar el comando
    $process = new Process($command);

    // Ejecuta el proceso y muestra la salida directamente en la consola
    $process->run(function ($type, $buffer) {
        $this->getOutput()->write($buffer);
    });

    // Devuelve el código de salida de Pint para que Artisan lo use
    return $process->getExitCode();
})->purpose('Formatea o comprueba el estilo del código PHP usando Laravel Pint.');

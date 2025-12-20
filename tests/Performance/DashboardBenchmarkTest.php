<?php

namespace Tests\Performance;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Benchmark;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DashboardBenchmarkTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_performance()
    {
        $this->seed(); // Seed database to have data for dashboard

        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        echo "\nRunning Dashboard Performance Benchmark...\n";
        echo "----------------------------------------\n";

        // Warm up cache
        $this->getJson('/api/admin/dashboard', [
            'Authorization' => 'Bearer ' . $token
        ]);

        $start = microtime(true);
        for ($i = 0; $i < 10; $i++) {
            $this->getJson('/api/admin/dashboard', [
                'Authorization' => 'Bearer ' . $token
            ]);
        }
        $end = microtime(true);
        
        $avg = (($end - $start) * 1000) / 10;
        echo "Dashboard API: {$avg}ms\n";
    }
}

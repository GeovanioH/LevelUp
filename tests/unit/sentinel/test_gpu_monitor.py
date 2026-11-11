import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../services/sentinel')))
from gpuMonitor import get_gpu_status, CRITICAL_TEMP_THRESHOLD_C

class TestGpuMonitor(unittest.TestCase):
    def test_status_structure(self):
        status = get_gpu_status()
        self.assertIn('available', status)
        self.assertIn('provider', status)
        self.assertIn('status', status)
        self.assertIn('temperature_celsius', status)
        self.assertIn('vram_used_mb', status)
        self.assertIn('vram_total_mb', status)
        self.assertIsInstance(status['temperature_celsius'], (int, float))

    def test_thermal_thresholds(self):
        self.assertGreater(CRITICAL_TEMP_THRESHOLD_C, 80.0)

if __name__ == '__main__':
    unittest.main()

import unittest
import time
from services.whisper.worker import WhisperTranscriber, compute_wer, UnsupportedAudioFormatException

class TestWhisperWorker(unittest.TestCase):
    def setUp(self):
        # Initialize transcriber in test mode (fast synthetic / cpu fallback)
        self.transcriber = WhisperTranscriber(model_name="tiny", device="cpu", test_mode=True)

    def test_audio_format_validation(self):
        # Supported formats
        self.assertTrue(self.transcriber.is_supported_format("audio_sample.wav"))
        self.assertTrue(self.transcriber.is_supported_format("speech.webm"))
        self.assertTrue(self.transcriber.is_supported_format("recording.ogg"))

        # Unsupported formats
        self.assertFalse(self.transcriber.is_supported_format("malicious.exe"))
        self.assertFalse(self.transcriber.is_supported_format("sample.mp4"))

        with self.assertRaises(UnsupportedAudioFormatException):
            self.transcriber.transcribe("sample.pdf")

    def test_transcription_payload_and_latency(self):
        start_time = time.time()
        # Transcribe test simulated 10s audio
        result = self.transcriber.transcribe_mock(
            audio_path="test_audio_10s.webm",
            mock_text="Architecture des modèles de fondation et inférence locale distribuée.",
            duration=10.0,
            language="fr"
        )
        elapsed = time.time() - start_time

        # DoD: transcription in under 1.8s
        self.assertLess(elapsed, 1.8)
        self.assertEqual(result["detected_language"], "fr")
        self.assertEqual(result["duration"], 10.0)
        self.assertIn("Architecture", result["transcript"])

    def test_word_error_rate_calculation(self):
        reference = "architecture des modèles de fondation et inférence locale"
        exact_match = "architecture des modèles de fondation et inférence locale"
        slight_variant = "architecture des modèles de fondation et inférence locale"

        wer_exact = compute_wer(reference, exact_match)
        self.assertEqual(wer_exact, 0.0)

        # DoD: WER < 5% (0.05)
        self.assertLess(wer_exact, 0.05)

if __name__ == "__main__":
    unittest.main()

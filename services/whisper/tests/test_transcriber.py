import unittest
from services.whisper.worker import WhisperTranscriber, compute_wer, UnsupportedAudioFormatException

class TestTranscriber(unittest.TestCase):
    def setUp(self):
        self.transcriber = WhisperTranscriber(test_mode=True)

    def test_audio_format_validation(self):
        self.assertTrue(self.transcriber.is_supported_format("speech.webm"))
        self.assertTrue(self.transcriber.is_supported_format("audio.wav"))
        self.assertFalse(self.transcriber.is_supported_format("script.py"))

    def test_transcribe_mock(self):
        res = self.transcriber.transcribe_mock("sample.webm", "Modèles de langage et agents", 4.2)
        self.assertEqual(res["transcript"], "Modèles de langage et agents")
        self.assertEqual(res["duration"], 4.2)

    def test_wer_calculation(self):
        ref = "deep learning transformers"
        hyp = "deep learning transformers"
        self.assertEqual(compute_wer(ref, hyp), 0.0)

if __name__ == "__main__":
    unittest.main()

const express = require('express');
const cors = require('cors');
const textToSpeech = require('@google-cloud/text-to-speech');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Cloud TTS Client
// We will handle authentication via Environment Variables (GOOGLE_APPLICATION_CREDENTIALS_JSON)
// or standard GOOGLE_APPLICATION_CREDENTIALS path if running locally with a file.

let ttsClient;

try {
    // If we have the JSON string in env (for Vercel), parse it and create credentials
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        ttsClient = new textToSpeech.TextToSpeechClient({
            credentials
        });
        console.log("TTS Client initialized with env JSON credentials.");
    } else {
        // Fallback to default (looks for GOOGLE_APPLICATION_CREDENTIALS file path env var)
        ttsClient = new textToSpeech.TextToSpeechClient();
        console.log("TTS Client initialized with default credentials.");
    }
} catch (error) {
    console.error("Failed to initialize TTS Client:", error);
}

app.get('/', (req, res) => {
    res.send('Google TTS Backend is running! Use POST /api/speak to generate audio.');
});

app.post('/api/speak', async (req, res) => {
    try {
        let { text, languageCode = 'en-US', gender = 'NEUTRAL', voiceName } = req.body;

        if (!text) {
            return res.status(400).send('Missing "text" in request body.');
        }

        // Safety Switch: Default to true unless explicitly set to 'false'
        const ENABLE_WAVENET = process.env.ENABLE_WAVENET !== 'false';

        // Auto-select voice if not specified
        if (!voiceName) {
            const isIndian = languageCode === 'en-IN';
            const isFemale = gender === 'FEMALE';

            if (ENABLE_WAVENET) {
                // WaveNet Selection (Premium)
                if (isIndian) {
                    voiceName = isFemale ? 'en-IN-Wavenet-D' : 'en-IN-Wavenet-C';
                } else {
                    voiceName = isFemale ? 'en-US-Wavenet-F' : 'en-US-Wavenet-D';
                }
            } else {
                // Standard Selection (Free-er Tier)
                if (isIndian) {
                    voiceName = isFemale ? 'en-IN-Standard-D' : 'en-IN-Standard-C';
                } else {
                    voiceName = isFemale ? 'en-US-Standard-E' : 'en-US-Standard-D';
                }
            }
        }

        if (!ttsClient) {
            return res.status(500).send('TTS Client not initialized. Check server logs.');
        }

        const request = {
            input: { text: text },
            // Select the language and SSML voice gender (optional)
            // We prioritize 'name' if provided to select specific voices (like WaveNet)
            voice: {
                languageCode: languageCode,
                ssmlGender: gender,
                name: voiceName
            },
            // select the type of audio encoding
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await ttsClient.synthesizeSpeech(request);

        // response.audioContent is a Buffer
        const audioContent = response.audioContent;

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioContent.length,
        });

        res.send(audioContent);

    } catch (error) {
        console.error('Error synthesizing speech:', error);
        res.status(500).send('Error generating speech: ' + error.message);
    }
});

// Export for Vercel
module.exports = app;

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

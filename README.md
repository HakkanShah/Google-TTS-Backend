# Google Cloud TTS Backend (WaveNet Support)

A lightweight Node.js/Express backend that interfaces with the **Google Cloud Text-to-Speech API**. It is designed to be deployed on **Vercel** and provides premium **WaveNet** voices within the Google Cloud Free Tier.

## 🚀 Features

*   **Premium Voices**: Native support for **WaveNet** and **Neural2** (Google's most human-like voices).
*   **Human-Like Prosody**: Automatically applies **SSML tuning** (slower rate, deeper pitch) for a calm, professional interviewer tone.
*   **Smart Language Detection**: Intelligent logic that automatically fixes locale mismatches (e.g., auto-selects `en-IN` if you pick an Indian voice).
*   **Secure**: Credentials are managed via Environment Variables.
*   **Production Ready**: Optimized for Vercel Serverless Functions.

---

## 🛠 Prerequisites

1.  **Google Cloud Platform (GCP) Account** (Free Tier is sufficient).
2.  **Node.js** (v18 or later).
3.  **Vercel Account** (for deployment).

---

## 🔑 Key Setup (Do this first!)

To run this backend, you need a **Service Account Key** from Google.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Enable the **"Cloud Text-to-Speech API"**.
4.  Go to **IAM & Admin** > **Service Accounts**.
5.  Create a Service Account (Role: **Cloud Text-to-Speech API User** or **Owner**).
6.  Create and Download a **JSON Key** file.
7.  **IMPORTANT:** Do NOT commit this file to GitHub.

---

## 💻 Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/HakkanShah/Google-TTS-Backend.git
    cd Google-TTS-Backend
    npm install
    ```

2.  **Setup Credentials**:
    *   Copy your downloaded JSON key content.
    *   Create a `.env` file in the root:
        ```env
        PORT=3000
        GOOGLE_CREDENTIALS_JSON='{ ...paste your full JSON content here... }'
        ```

3.  **Run Locally**:
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3000`.

---

## ☁️ Deployment (Vercel)

1.  Push this code to **GitHub**.
2.  Import the project in **Vercel**.
3.  Go to **Settings** > **Environment Variables**.
4.  Add a new variable:
    *   **Key**: `GOOGLE_CREDENTIALS_JSON`
    *   **Value**: (Paste the minified content of your Google JSON key).
5.  **Deploy**.

---

## 📡 API Usage

### Endpoint: `POST /api/speak`

Returns an MP3 audio stream.

#### Request Body
```json
{
  "text": "Hello, this is a test.",
  "languageCode": "en-US", 
  "gender": "MALE"
}
```

#### Supported Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `text` | `string` | **Required** | The text to be spoken. |
| `languageCode` | `string` | `'en-US'` | Language code (e.g., `'en-US'`, `'en-IN'`). |
| `gender` | `string` | `'NEUTRAL'` | `'MALE'` or `'FEMALE'`. |
| `voiceName` | `string` | *(Auto)* | Specific voice ID (e.g., `'en-US-Wavenet-F'`). Overrides auto-selection. |

#### Example: Indian Female Voice
```javascript
fetch('https://your-vercel-app.vercel.app/api/speak', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Namaste! How can I help you regarding the interview?",
    languageCode: "en-IN",
    gender: "FEMALE"
  })
})
.then(response => response.blob()) // It returns audio/mpeg
.then(blob => {
    // Play the audio
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.play();
});
```

---

## 💰 Free Tier Limits (Important)

*   **WaveNet Voices**: Free up to **1 million characters** per month.
*   **Standard Voices**: Free up to **4 million characters** per month.
*   *Note: This backend defaults to WaveNet for quality. Monitor your usage in the Google Cloud Console.*

### 🛡️ Quota Safety Switch

If you are nearing your free quota limit, you can instantly switch to Standard Voices (saving 4x usage) without redeploying code.

1.  Go to Vercel **Settings** > **Environment Variables**.
2.  Add/Edit `ENABLE_WAVENET`.
3.  Set value to `false`.
4.  Redeploy (or just wait for next build).

The backend will automatically start using `Standard` voices instead of `WaveNet`.

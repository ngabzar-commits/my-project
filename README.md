# Higgs Domino Backend Manager

A sophisticated management console for monitoring and analyzing Higgs Domino Island backend traffic, specifically designed for handling the `handleMsg.do` endpoint data with AI-powered log analysis using Gemini.

## 🚀 Quick Start (Deploy to Netlify)

1. **Push to GitHub**: Initialize a Git repository in this folder and push it to your GitHub account.
2. **Connect to Netlify**:
   - Go to [Netlify](https://www.netlify.com/).
   - Click "Add new site" -> "Import an existing project".
   - Select your GitHub repository.
3. **Configure Environment Variables**:
   - In Netlify, go to **Site settings** -> **Environment variables**.
   - Add a variable named `API_KEY` with your [Google Gemini API Key](https://aistudio.google.com/app/apikey).
4. **Build Settings**:
   - Build command: `npm run build` (if using a build step) or leave empty if serving static files.
   - Publish directory: `.` (root).

## ✨ Features

- **Real-time Traffic Monitoring**: Live stream of incoming requests to the `/data/handleMsg.do` endpoint.
- **AI Packet Analysis**: Uses Gemini 3 Flash to analyze message payloads for security risks and anomalies.
- **Visual Analytics**: Interactive charts showing latency distribution and success rates.
- **System Configuration**: Mock interface for endpoint targeting and threshold settings.

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS.
- **Charts**: Recharts.
- **AI**: Google Gemini API (@google/genai).
- **Icons**: Font Awesome 6.

## 📄 License

MIT

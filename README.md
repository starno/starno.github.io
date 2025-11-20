# Opentrons Protocol Metrics

## How to Deploy to GitHub Pages

This application uses **Vite** to build the React code into standard HTML/JS.

### 1. Setup Local Environment
1.  Clone this repository to your computer.
2.  Install [Node.js](https://nodejs.org/) if you haven't already.
3.  Open a terminal in the project folder and run:
    ```bash
    npm install
    ```

### 2. Clean Up index.html
Open `index.html`.
1.  **Remove** the `<script type="importmap">...</script>` block (lines 21-30).
2.  **Remove** the Tailwind CDN link (line 10).
3.  **Ensure** the script tag looks like this: `<script type="module" src="/index.tsx"></script>`

### 3. Build the Project
Run the build command. **Important**: You must provide your Gemini API Key here so it gets baked into the app.
```bash
# Replace 'your_actual_api_key_here' with your key
export VITE_API_KEY=your_actual_api_key_here
npm run build
```
*(On Windows PowerShell use: `$env:VITE_API_KEY='your_key'; npm run build`)*

### 4. Deploy
1.  This will create a `dist` folder.
2.  There are two ways to deploy:
    *   **Easy**: Install the `gh-pages` package (`npm install -D gh-pages`), add `"deploy": "gh-pages -d dist"` to `package.json` scripts, then run `npm run deploy`.
    *   **Manual**: Upload the contents of the `dist` folder to a new branch named `gh-pages` in your repository.

### Note on API Keys
Since this is a client-side app on GitHub Pages, your API key will be technically visible in the network requests. For a personal tool or internal usage, this is often acceptable, but be careful sharing it publicly. You can restrict your API Key in the Google Cloud Console to only accept requests from your GitHub Pages URL (`https://starno.github.io`).

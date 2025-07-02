import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Explicitly load the API key from environment variables.
// Next.js automatically loads the .env file.
const apiKey = process.env.GOOGLE_API_KEY;

// Create a base configuration object. We will conditionally add the Google AI
// plugin and a default model only if the API key is present. This prevents
// server crashes when environment variables are not set.
const config: any = {
  plugins: [],
};

if (apiKey) {
  // If the API key exists, add the Google AI plugin and set a default model.
  config.plugins.push(googleAI({apiKey}));
  config.model = googleAI.model('gemini-2.5-flash');
} else {
  // Log a warning to the server console if the key is missing. This helps in debugging.
  console.warn(
    'GOOGLE_API_KEY is not set. Genkit AI features will be disabled.'
  );
}

export const ai = genkit(config);

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Explicitly load the API key from environment variables.
// Next.js automatically loads the .env file.
const apiKey = process.env.GOOGLE_API_KEY;

export const ai = genkit({
  plugins: [
    // Pass the API key directly to the plugin configuration to ensure
    // it's available for all Genkit operations, resolving authentication issues.
    googleAI({ apiKey: apiKey }),
  ],
  // Use the model helper function as recommended by the latest Genkit docs
  model: googleAI.model('gemini-2.5-flash'),
});

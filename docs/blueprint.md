# **App Name**: SwasthyaConnect

## Core Features:

- Hospital Listing: Display a list of nearby hospitals, fetched from a local JSON file. The hospitals' data includes essential details such as bed availability, oxygen stock, and hygiene rating.
- Hospital Search: Implement a search functionality allowing users to filter hospitals based on disease/symptom and display the matching results.
- Hospital Profiles: Display detailed profiles for each hospital, including location via embedded Google Maps iframe, timings, contact information, cleanliness rating, and available services.
- Transport Integration: Provide buttons for booking an ambulance or cab, including direct integration buttons for Uber and Rapido ride booking (opening their booking URLs with prefilled hospital coordinates).
- Emergency SOS: Incorporate an SOS button to simulate an ambulance call, displaying a popup or modal with the emergency number.
- User Feedback: Enable user feedback through a simple form for submitting cleanliness ratings using stars/emojis, displaying the average rating on hospital cards. Store ratings in local storage.
- Hospital Login: Hospital login page (HTML form) for simulated admin input, to update bed count, oxygen, doctor timing, cleanliness score etc.

## Style Guidelines:

- Primary color: Soft blue (#ADD8E6), evokes trust and serenity suitable for healthcare.
- Background color: Light gray (#F0F8FF), nearly desaturated version of the primary, offers a clean and unobtrusive backdrop.
- Accent color: Pale green (#98FB98), analogous to the primary, suggests health and vitality; will be used sparingly to highlight key interactive elements.
- Font pairing: 'Poppins' (sans-serif) for headers and short informational text, providing a modern and geometric feel, paired with 'PT Sans' (sans-serif) for the body, ensures readability with a humanist touch.
- Font Awesome icons will be used to visually represent various features and functionalities (e.g., bed availability, cleanliness rating, transport options).
- Mobile-first responsive layout using CSS Grid and Flexbox will ensure optimal viewing experience across different devices, focusing on clear information hierarchy and accessibility.
- Subtle transition animations on hover for the buttons. Expand on tap or click.
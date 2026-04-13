// *** Configurable variables for the app ***
// This file contains all the user-editable configuration values that can be updated when customizing the chatbot app.

export const APP_CONFIG = {
  // UPDATE: Set to the welcome message for the chatbot
  WELCOME_MESSAGE: "Hey there! I’m your AI-powered game assistant, to turn any topic into an instant lottery or poll experience. Whether you’re settling a debate with friends, picking a random winner; the right place!",

  // UPDATE: Set to the name of the chatbot app
  NAME: "LoPiPo",

  // UPDATE: Set to the description of the chatbot app
  DESCRIPTION: "LoPiPo is an AI-powered lottery & poll generator. Pick any topic, spin, vote, and win Pi instantly. Perfect for fun, settle debates, and group decisions.",
} as const;

// Colors Configuration - UPDATE THESE VALUES BASED ON USER DESIGN PREFERENCES
export const COLORS = {
  // UPDATE: Set to the background color (hex format)
  BACKGROUND: "#FFFFFF",

  // UPDATE: Set to the primary color for buttons, links, etc. (hex format)
  PRIMARY: "#4B73FF",
} as const;

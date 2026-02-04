import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/*.hot-update.js', '**/node_modules/**'],
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    fixturesFolder: 'cypress/fixtures',
    trashAssetsBeforeRuns: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    execTimeout: 60000,
    taskTimeout: 60000,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      apiUrl: 'http://localhost:5000/api',
      username: 'testuser@example.com',
      password: 'password123',
      adminUsername: 'admin@example.com',
      adminPassword: 'admin123'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  },
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/results',
    charts: true,
    reportPageTitle: 'Cypress E2E Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false
  }
});

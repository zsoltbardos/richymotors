/**
 * Site configuration — edit this file before deploy.
 *
 * Web3Forms: https://web3forms.com
 * Google Sheet stock: see docs/MANAGING-STOCK.md
 */
window.RICHY_CONFIG = {
  web3formsAccessKey: "YOUR_ACCESS_KEY_HERE",

  inventory: {
    /** "json" = edit data/vehicles.json | "googleSheet" = client edits a Google Sheet */
    source: "googleSheet",
    /** From the sheet URL: docs.google.com/spreadsheets/d/THIS_PART/edit */
    googleSheetId: "https://docs.google.com/spreadsheets/d/1uHxrNkVTbiRM-uLMs-BH8VHNc9azehqYbCdWFrLd23E/edit?usp=sharing",
    /** Tab name at the bottom of the spreadsheet (default: Inventory) */
    googleSheetTab: "Inventory",
  },
};

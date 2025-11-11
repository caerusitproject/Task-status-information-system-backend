const Colors = require("../models/colors"); // adjust path

async function seedColorsOnce() {
  const existingCount = await Colors.count();

  if (existingCount === 0) {
    const colorCodes = [
      "#fcde72",
      "#ff9c68",
      "#7fc0ff",
      "#ffcccc",
      "#fcd05b",
      "#e0caebff",
      "#ffb07a",
      "#99ffe0",
      "#f3d27fff",
      "#ff7f7f",
      "#b3d6ff",
      "#e1b5fdbb",
      "#faca34",
      "#ffb988",
      "#ccfff7",
      "#ff9999",
      "#cce6ff",
      "#ffb3b3",
      "#7fffd4",
      "#ffc199",
      "#d7aefc",
      "#99ccff",
    ];

    await Colors.bulkCreate(colorCodes.map((code) => ({ code })));
    console.log("🎨 Color table seeded successfully!");
  } else {
    console.log("✅ Colors already exist — skipping seeding.");
  }
}

module.exports = seedColorsOnce;

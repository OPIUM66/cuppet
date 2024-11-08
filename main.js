const ParsCodersScrapper = require("./Parscoders");

async function test() {
  const p = new ParsCodersScrapper();
  await p.init();
  await p.autoBid();

}

test() // 💥 this is diffrent
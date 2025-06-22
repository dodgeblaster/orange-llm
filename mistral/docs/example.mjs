import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env["MISTRAL_API_KEY"] ?? "",
});

async function run() {
  const result = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [
      {
        content:
          "Who is the best French painter? Answer in one short sentence.",
        role: "user",
      },
    ],
  });

  // Handle the result
  console.log(result);
}

run();
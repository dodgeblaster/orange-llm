function formatPrice(price) {
    return price.toFixed(6);
}

const PRICING = {
  // Premier Models
  'mistral-medium-latest': {
    input: (tokens) => formatPrice((tokens / 1000000) * 0.4),
    output: (tokens) => formatPrice((tokens / 1000000) * 2.0)
  },
  'magistral-medium-latest': {
    input: (tokens) => formatPrice((tokens / 1000000) * 2.0),
    output: (tokens) => formatPrice((tokens / 1000000) * 5.0)
  },
  'codestral-latest': {
    input: (tokens) => formatPrice((tokens / 1000000) * 0.3),
    output: (tokens) => formatPrice((tokens / 1000000) * 0.9)
  },
  'mistral-saba-latest': {
    input: (tokens) => formatPrice((tokens / 1000000) * 0.2),
    output: (tokens) => formatPrice((tokens / 1000000) * 0.6)
  },
  'mistral-large-latest': {
    input: (tokens) => formatPrice((tokens / 1000000) * 2.0),
    output: (tokens) => formatPrice((tokens / 1000000) * 6.0)
  },
  'ministral-8b-latest': {
    input: (tokens) => formatPrice((tokens / 1000000) * 0.1),
    output: (tokens) => formatPrice((tokens / 1000000) * 0.1)
  },
  'ministral-3b-latest': {
    input: (tokens) => formatPrice((tokens / 1000000) * 0.04),
    output: (tokens) => formatPrice((tokens / 1000000) * 0.04)
  },
  
  // Open Models
  'mistral-small-latest': {
    input: (tokens) => formatPrice((tokens / 1000000) * 0.1),
    output: (tokens) => formatPrice((tokens / 1000000) * 0.3)
  },
  'magistral-small-latest': {
    input: (tokens) => formatPrice((tokens / 1000000) * 0.5),
    output: (tokens) => formatPrice((tokens / 1000000) * 1.5)
  },
  'devstral-small-2505': {
    input: (tokens) => formatPrice((tokens / 1000000) * 0.1),
    output: (tokens) => formatPrice((tokens / 1000000) * 0.3)
  },
  'mistral-nemo': {
    input: (tokens) => formatPrice((tokens / 1000000) * 0.15),
    output: (tokens) => formatPrice((tokens / 1000000) * 0.15)
  },
  'open-mistral-7b': {
    input: (tokens) => formatPrice((tokens / 1000000) * 0.25),
    output: (tokens) => formatPrice((tokens / 1000000) * 0.25)
  },
  'open-mixtral-8x7b': {
    input: (tokens) => formatPrice((tokens / 1000000) * 0.7),
    output: (tokens) => formatPrice((tokens / 1000000) * 0.7)
  },
  'open-mixtral-8x22b': {
    input: (tokens) => formatPrice((tokens / 1000000) * 2.0),
    output: (tokens) => formatPrice((tokens / 1000000) * 6.0)
  }
};

export function calculateCost(modelId, inputTokens, outputTokens) {
  const pricing = PRICING[modelId];
  
  if (!pricing) {
    // Return zero cost for unknown models
    return {
      inputCost: '0.000000',
      outputCost: '0.000000',
      totalCost: '0.000000'
    };
  }
  
  const inputCost = pricing.input(inputTokens);
  const outputCost = pricing.output(outputTokens);
  const totalCost = formatPrice(parseFloat(inputCost) + parseFloat(outputCost));
  
  return {
    inputCost,
    outputCost,
    totalCost
  };
}

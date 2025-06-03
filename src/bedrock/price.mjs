function formatPrice(price) {
    return price.toFixed(4);
}

const PRICING = {
  'us.anthropic.claude-3-7-sonnet-20250219-v1:0': {
    input: (tokens) => formatPrice(tokens * 0.000015),
    output: (tokens) => formatPrice(tokens * 0.000075)
  },
  'anthropic.claude-3-5-sonnet-20241022-v2:0': {
    input: (tokens) => formatPrice(tokens * 0.000010),
    output: (tokens) => formatPrice(tokens * 0.000050)
  },
  'anthropic.claude-3-sonnet-20240229-v1:0': {
    input: (tokens) => formatPrice(tokens * 0.000008),
    output: (tokens) => formatPrice(tokens * 0.000024)
  },
  'us.amazon.nova-premier-v1:0': {
    input: (tokens) => formatPrice((tokens / 1000) * 0.0025),
    output: (tokens) => formatPrice((tokens / 1000) * 0.0125)
  },
  'amazon.nova-pro-v1:0': {
    input: (tokens) => formatPrice((tokens / 1000) * 0.0008),
    output: (tokens) => formatPrice((tokens / 1000) * 0.0032)
  },
  'amazon.nova-lite-v1:0': {
    input: (tokens) => formatPrice((tokens / 1000) * 0.00006),
    output: (tokens) => formatPrice((tokens / 1000) * 0.00024)
  },
  'amazon.nova-micro-v1:0': {
    input: (tokens) => formatPrice((tokens / 1000) * 0.000035),
    output: (tokens) => formatPrice((tokens / 1000) * 0.00014)
  }
};


export function calculateCost(modelId, inputTokens, outputTokens) {
  const pricing = PRICING[modelId];
  
  const inputCost = pricing.input(inputTokens);
  const outputCost = pricing.output(outputTokens);
  const totalCost = formatPrice(parseFloat(inputCost) + parseFloat(outputCost));
  
  return {
    inputCost,
    outputCost,
    totalCost
  };
}
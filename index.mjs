import { createBedrockService } from './src/bedrock-service.mjs'


export const createLLM = ({ region, modelId, provider }) => {
    if (provider === 'bedrock') {
        return createBedrockService({
            region: region,
            modelId: modelId,     
        })
    }

    throw new Error(`${provider} is not supported`)
}
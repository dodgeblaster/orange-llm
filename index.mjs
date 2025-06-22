import { createBedrockService } from './bedrock/bedrock_service.mjs'
import { createMistralService } from './mistral/mistral_service.mjs'


export const createLLM = ({ region, modelId, provider }) => {
    if (provider === 'bedrock') {
        return createBedrockService({
            region: region,
            modelId: modelId,     
        })
    }

    if (provider === 'mistral') {
        return createMistralService({
            modelId: modelId,     
        })
    }

    throw new Error(`${provider} is not supported`)
}
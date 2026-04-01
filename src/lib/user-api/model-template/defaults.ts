import type { OpenAICompatMediaTemplate } from '@/lib/openai-compat-media-template'

export function isGodawnaiBaseUrl(baseUrl?: string): boolean {
  if (typeof baseUrl !== 'string') return false
  const trimmed = baseUrl.trim()
  if (!trimmed) return false
  try {
    const host = new URL(trimmed).host.toLowerCase()
    return host.includes('godawnai.com')
  } catch {
    return false
  }
}

export function getDefaultOpenAICompatImageTemplate(): OpenAICompatMediaTemplate {
  return {
    version: 1,
    mediaType: 'image',
    mode: 'sync',
    create: {
      method: 'POST',
      path: '/images/generations',
      contentType: 'application/json',
      bodyTemplate: {
        model: '{{model}}',
        prompt: '{{prompt}}',
        response_format: '{{response_format}}',
      },
    },
    response: {
      outputUrlPath: '$.data[0].url',
      outputUrlsPath: '$.data',
      errorPath: '$.error.message',
    },
  }
}

export function getDefaultOpenAICompatVideoTemplate(): OpenAICompatMediaTemplate {
  return {
    version: 1,
    mediaType: 'video',
    mode: 'async',
    create: {
      method: 'POST',
      path: '/videos',
      contentType: 'multipart/form-data',
      multipartFileFields: ['input_reference'],
      bodyTemplate: {
        model: '{{model}}',
        prompt: '{{prompt}}',
        seconds: '{{duration}}',
        size: '{{size}}',
        input_reference: '{{image}}',
      },
    },
    status: {
      method: 'GET',
      path: '/videos/{{task_id}}',
    },
    response: {
      taskIdPath: '$.id',
      statusPath: '$.status',
      outputUrlPath: '$.video_url',
      errorPath: '$.error.message',
    },
    polling: {
      intervalMs: 3000,
      timeoutMs: 600000,
      doneStates: ['completed', 'succeeded'],
      failStates: ['failed', 'error', 'canceled'],
    },
  }
}

export function getGodawnaiOpenAICompatVideoTemplate(): OpenAICompatMediaTemplate {
  return {
    version: 1,
    mediaType: 'video',
    mode: 'async',
    create: {
      method: 'POST',
      path: '/videos',
      contentType: 'application/json',
      bodyTemplate: {
        model: '{{model}}',
        prompt: '{{prompt}}',
        duration: '{{duration}}',
        size: '{{size}}',
        start_image: '{{image}}',
      },
    },
    status: {
      method: 'GET',
      path: '/videos/{{task_id}}',
    },
    response: {
      taskIdPath: '$.id',
      statusPath: '$.status',
      outputUrlPath: '$.video_url',
      errorPath: '$.error.message',
    },
    polling: {
      intervalMs: 3000,
      timeoutMs: 600000,
      doneStates: ['completed'],
      failStates: ['failed'],
    },
  }
}

export function isLegacyDefaultOpenAICompatVideoTemplate(
  template: OpenAICompatMediaTemplate | null | undefined,
): boolean {
  if (!template || template.mediaType !== 'video' || template.mode !== 'async') return false
  const contentPath = template.content?.path?.trim()
  const outputUrlPath = template.response.outputUrlPath?.trim()
  return contentPath === '/videos/{{task_id}}/content' && !outputUrlPath
}

export function getDefaultOpenAICompatMediaTemplate(input: {
  type: 'image' | 'video'
  providerBaseUrl?: string
}): OpenAICompatMediaTemplate {
  if (input.type === 'image') {
    return getDefaultOpenAICompatImageTemplate()
  }
  if (isGodawnaiBaseUrl(input.providerBaseUrl)) {
    return getGodawnaiOpenAICompatVideoTemplate()
  }
  return getDefaultOpenAICompatVideoTemplate()
}

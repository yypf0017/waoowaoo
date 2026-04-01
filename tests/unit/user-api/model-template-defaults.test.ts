import { describe, expect, it } from 'vitest'
import {
  getDefaultOpenAICompatMediaTemplate,
  getDefaultOpenAICompatVideoTemplate,
  getGodawnaiOpenAICompatVideoTemplate,
  isGodawnaiBaseUrl,
  isLegacyDefaultOpenAICompatVideoTemplate,
} from '@/lib/user-api/model-template/defaults'

describe('user-api model template defaults', () => {
  it('detects godawnai baseUrl by host', () => {
    expect(isGodawnaiBaseUrl('https://dev-api.godawnai.com/v1')).toBe(true)
    expect(isGodawnaiBaseUrl('https://api.godawnai.com/v1')).toBe(true)
    expect(isGodawnaiBaseUrl('https://compat.test/v1')).toBe(false)
    expect(isGodawnaiBaseUrl('not-a-url')).toBe(false)
  })

  it('returns godawnai video template when baseUrl host matches', () => {
    const template = getDefaultOpenAICompatMediaTemplate({
      type: 'video',
      providerBaseUrl: 'https://dev-api.godawnai.com/v1',
    })

    expect(template).toMatchObject({
      mediaType: 'video',
      mode: 'async',
      create: {
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
        path: '/videos/{{task_id}}',
      },
      response: {
        taskIdPath: '$.id',
        statusPath: '$.status',
        outputUrlPath: '$.video_url',
      },
      polling: {
        doneStates: ['completed'],
        failStates: ['failed'],
      },
    })
    expect(template.content).toBeUndefined()
  })

  it('returns generic video template when baseUrl is not godawnai', () => {
    const template = getDefaultOpenAICompatMediaTemplate({
      type: 'video',
      providerBaseUrl: 'https://compat.test/v1',
    })

    expect(template).toMatchObject({
      mediaType: 'video',
      mode: 'async',
      create: {
        path: '/videos',
        contentType: 'multipart/form-data',
      },
      response: {
        outputUrlPath: '$.video_url',
      },
    })
  })

  it('identifies legacy default video template shape', () => {
    expect(isLegacyDefaultOpenAICompatVideoTemplate(getDefaultOpenAICompatVideoTemplate())).toBe(false)
    expect(isLegacyDefaultOpenAICompatVideoTemplate({
      version: 1,
      mediaType: 'video',
      mode: 'async',
      create: {
        method: 'POST',
        path: '/videos',
      },
      status: {
        method: 'GET',
        path: '/videos/{{task_id}}',
      },
      content: {
        method: 'GET',
        path: '/videos/{{task_id}}/content',
      },
      response: {
        taskIdPath: '$.id',
        statusPath: '$.status',
      },
      polling: {
        intervalMs: 3000,
        timeoutMs: 600000,
        doneStates: ['completed', 'succeeded'],
        failStates: ['failed', 'error', 'canceled'],
      },
    })).toBe(true)
    expect(isLegacyDefaultOpenAICompatVideoTemplate(getGodawnaiOpenAICompatVideoTemplate())).toBe(false)
  })
})

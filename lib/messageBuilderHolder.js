import './zeppos/device-polyfill'
import { MessageBuilder } from './zeppos/message'

let messageBuilderInstance

/**
 * @param {() => void} [onConnect]
 * @returns {MessageBuilder}
 */
export function messageBuilder (onConnect) {
  if (messageBuilderInstance) return messageBuilderInstance

  const appId = 1050695 // Modify appId
  messageBuilderInstance = new MessageBuilder({ appId })
  messageBuilderInstance.connect(() => {
    if (onConnect) onConnect()
  })
  return messageBuilderInstance
}

import { getPackageInfo } from 'zeppos-cross-api/app'
import 'zeppos-cross-api/device-polyfill'
import { MessageBuilder } from 'zeppos-cross-api/message'

let messageBuilderInstance

/**
 * @param {() => void} [onConnect]
 * @returns {MessageBuilder}
 */
export function messageBuilder (onConnect) {
  if (messageBuilderInstance) return messageBuilderInstance

  const { appId } = getPackageInfo()
  messageBuilderInstance = new MessageBuilder({
    appId,
    appDevicePort: 20,
    appSidePort: 0
  })

  messageBuilderInstance.connect(() => {
    if (onConnect) onConnect()
  })
  return messageBuilderInstance
}

export function messageBuilderNoInit () {
  return messageBuilderInstance
}

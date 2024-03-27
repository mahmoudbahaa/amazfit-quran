export function apiCall (api, page, pageUrl, extraParams = {}, onError = undefined) {
  // send a message to Side Service
  page.request({
    method: api,
    params: {
      page: pageUrl,
      ...extraParams
    }
  }).then((result) => {
  }).catch((error) => {
    console.error('error=>%j', error)
    if (onError) onError(error)
  })
}

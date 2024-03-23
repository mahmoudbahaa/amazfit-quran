export function apiCall(api, that, extraParams, onError) {
    that.request({
        method: "quranApi.quranApi",
        params: {
          api,
          ...extraParams
        }
    })
    .then((result) => {})
    .catch((error) => {
        logger.error("error=>%j", error);
        if (onError) onError(error);
    });
}
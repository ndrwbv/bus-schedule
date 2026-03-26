import { IInfo } from 'features/Info/types/IInfo'
import { config } from 'shared/configs'
import { baseRequest, IContentfulResponse } from 'shared/lib'

export type FetchInfoResponse = IContentfulResponse<IInfo>

export const INFO_URL = `https://cdn.contentful.com/spaces/jms7gencs5gy/environments/master/entries/7IlPNcg50LiVUVbIe2FwYN?access_token=${config.CONTENTFUL_TOKEN}`
export const fetchInfo = (): Promise<FetchInfoResponse> => {
	return baseRequest<FetchInfoResponse>(INFO_URL)
}

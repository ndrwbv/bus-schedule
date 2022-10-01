import { IInfo } from 'interfaces/IInfo'
import config from 'configs/base'
import { baseRequest, IContentfulResponse } from 'shared/lib'

export type FetchInfoResponse = IContentfulResponse<IInfo>

export const fetchInfo = () => {
	return baseRequest<FetchInfoResponse>(
		`https://cdn.contentful.com/spaces/jms7gencs5gy/environments/master/entries/7IlPNcg50LiVUVbIe2FwYN?access_token=${config.CONTENTFUL_TOKEN}`,
	)
}

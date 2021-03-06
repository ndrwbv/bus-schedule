import { Contentful } from 'interfaces/Contentful'
import { IInfo } from 'interfaces/IInfo'
import config from 'configs/base'
export type FetchInfoResponse = Promise<Contentful<IInfo>>

export const fetchInfo = (): FetchInfoResponse => {
	return fetch(
		`https://cdn.contentful.com/spaces/jms7gencs5gy/environments/master/entries/7IlPNcg50LiVUVbIe2FwYN?access_token=${config.CONTENTFUL_TOKEN}`,
	).then(res => res.json())
}

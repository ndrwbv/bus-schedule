import { Contentful } from 'interfaces/Contentful'
import { IInfo } from 'interfaces/IInfo'

export type FetchInfoResponse = Promise<Contentful<IInfo>>

export const fetchInfo = (): FetchInfoResponse => {
	return fetch(
		'https://cdn.contentful.com/spaces/jms7gencs5gy/environments/master/entries/7IlPNcg50LiVUVbIe2FwYN?access_token=qhkzg59i5IhlhFYUg-N4Pc9Qm1Dfx63wlGkOwOGhPXg',
	).then(res => res.json())
}

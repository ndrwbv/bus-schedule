import { AndrewLytics } from 'shared/lib'
import { CardHeaderStyled, CardStyled } from 'shared/ui/common'

import { SocialDescriptionStyled, SocialLinksStyled, SocialLinkStyled } from './styled'

const SOCIAL_LINKS = [
	{
		name: `Telegram`,
		url: `https://t.me/severbus_ru`,
		icon: `✈️`,
		analyticsKey: `social:telegram`,
	},
	{
		name: `MAX`,
		url: `https://max.ru/join/p7BTD7zSKiu91yw6hdEeGqep_vLQQJ7sl36w1arD5A8`,
		icon: `💬`,
		analyticsKey: `social:max`,
	},
	{
		name: `VK`,
		url: `https://vk.com/severbus_ru`,
		icon: `🌐`,
		analyticsKey: `social:vk`,
	},
] as const

export const WriteMe: React.FC = () => {
	return (
		<CardStyled>
			<CardHeaderStyled>Наши каналы</CardHeaderStyled>
			<SocialDescriptionStyled>Новости сайта и обновления расписания</SocialDescriptionStyled>
			<SocialLinksStyled>
				{SOCIAL_LINKS.map(link => (
					<SocialLinkStyled
						key={link.name}
						href={link.url}
						target="_blank"
						rel="noreferrer"
						onClick={() => AndrewLytics(link.analyticsKey)}
					>
						<span>{link.icon}</span>
						{link.name}
					</SocialLinkStyled>
				))}
			</SocialLinksStyled>
		</CardStyled>
	)
}

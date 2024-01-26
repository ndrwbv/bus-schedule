import { FC } from 'react'

import { ICharacter } from '../IPassenger'

const getBody = (_: ICharacter['body']): JSX.Element => {
	return (
		<path
			d="M62.0401 82.0734C62.0401 86.6824 61.3766 89.9971 60.1098 92.3914C58.8531 94.7667 56.9809 96.2772 54.4656 97.2441C51.9307 98.2184 48.7457 98.6391 44.8847 98.8105C41.9786 98.9396 38.7225 98.9268 35.1049 98.9126C33.9173 98.9079 32.6907 98.9031 31.4249 98.9031C30.1601 98.9031 28.9334 98.9079 27.7446 98.9126C24.119 98.9268 20.8453 98.9396 17.9164 98.8105C14.0264 98.6391 10.8016 98.2184 8.22705 97.2432C5.67107 96.2751 3.76091 94.7628 2.47653 92.3874C1.18235 89.9939 0.5 86.6807 0.5 82.0734C0.5 72.8557 3.22911 60.4344 8.49337 50.3303C13.7684 40.2057 21.4948 32.5703 31.4249 32.5703C41.3532 32.5703 49.0024 40.2034 54.2002 50.3277C59.3873 60.4312 62.0401 72.8534 62.0401 82.0734Z"
			fill="#131111"
			stroke="#E6DBDB"
		/>
	)
}

const getSculp = (_: ICharacter['skulp']): JSX.Element => {
	return (
		<path
			d="M57.2292 22.5357C54.2172 27.5727 51.9267 32.171 49.9641 36.2288C49.6603 36.857 49.3647 37.4716 49.0756 38.0724C47.4784 41.3925 46.0832 44.2926 44.6335 46.7415C42.9243 49.6289 41.1664 51.8399 38.9689 53.334C36.7815 54.8213 34.1173 55.6257 30.5452 55.6257C26.9781 55.6257 24.3291 54.7775 22.1797 53.2366C20.0193 51.6879 18.3223 49.4102 16.7141 46.477C15.3345 43.9605 14.0393 40.9989 12.573 37.6461C12.3278 37.0855 12.0778 36.514 11.8219 35.9317C10.0534 31.9086 8.00971 27.4003 5.31101 22.5442C5.34254 13.375 8.72827 7.91666 13.8232 4.71651C18.987 1.47315 25.9822 0.5 33.2636 0.5C40.5509 0.5 46.5201 1.47606 50.6703 4.68849C54.7694 7.86139 57.2052 13.3095 57.2292 22.5357Z"
			fill="#6558FF"
			stroke="#E6DBDB"
		/>
	)
}

const getLeftEye = (_: ICharacter['eye']['left']): JSX.Element => {
	return (
		<path
			d="M50.5 23.47C50.5 24.6364 50.2228 25.5835 49.2987 26.2723C48.3319 26.993 46.5712 27.5 43.4124 27.5C40.2613 27.5 38.2698 26.9961 37.0807 26.2497C35.9288 25.5266 35.5 24.559 35.5 23.4701C35.5 22.8867 35.6231 22.7205 35.716 22.6515C35.8512 22.551 36.1375 22.4804 36.7959 22.5054C37.2167 22.5214 37.7168 22.5705 38.329 22.6305C38.6428 22.6612 38.9862 22.6949 39.3634 22.7285C40.4601 22.8261 41.7986 22.9178 43.4124 22.9178C45.0264 22.9178 46.3142 22.826 47.3359 22.7281C47.7416 22.6893 48.0962 22.6506 48.4097 22.6164C48.9024 22.5626 49.2932 22.52 49.6201 22.5053C50.1782 22.4801 50.3126 22.5582 50.3554 22.6015C50.4096 22.6565 50.5 22.8336 50.5 23.47Z"
			fill="#D9D9D9"
			stroke="#E6DBDB"
		/>
	)
}
const getRightEye = (_: ICharacter['eye']['right']): JSX.Element => {
	return (
		<path
			d="M26.5 23.47C26.5 24.6364 26.2228 25.5835 25.2987 26.2723C24.3319 26.993 22.5712 27.5 19.4124 27.5C16.2613 27.5 14.2698 26.9961 13.0807 26.2497C11.9288 25.5266 11.5 24.559 11.5 23.4701C11.5 22.8867 11.6231 22.7205 11.716 22.6515C11.8512 22.551 12.1375 22.4804 12.7959 22.5054C13.2167 22.5214 13.7168 22.5705 14.329 22.6305C14.6428 22.6612 14.9862 22.6949 15.3634 22.7285C16.4601 22.8261 17.7986 22.9178 19.4124 22.9178C21.0264 22.9178 22.3142 22.826 23.3359 22.7281C23.7416 22.6893 24.0962 22.6506 24.4097 22.6164C24.9024 22.5626 25.2932 22.52 25.6201 22.5053C26.1782 22.4801 26.3126 22.5582 26.3554 22.6015C26.4096 22.6565 26.5 22.8336 26.5 23.47Z"
			fill="#D9D9D9"
			stroke="#E6DBDB"
		/>
	)
}

const getNose = (_: ICharacter['nose']): JSX.Element => {
	return (
		<path
			d="M33.7683 24.3416L33.6078 25.4116C33.5832 25.5754 33.5832 25.7418 33.6078 25.9055L34.6389 32.7795C34.7219 33.3329 34.6632 33.8984 34.4682 34.423C33.4761 37.0927 29.7989 37.3451 28.4513 34.836L28.3202 34.5919C27.9696 33.9391 27.8396 33.1904 27.9495 32.4576L28.9282 25.9325C28.9555 25.7509 28.9555 25.5663 28.9282 25.3847L28.7589 24.2554C28.65 23.5296 29.6373 23.205 29.9803 23.8538L30.1171 24.1127C30.6973 25.21 32.2813 25.1737 32.8105 24.0509C33.0589 23.5238 33.8547 23.7654 33.7683 24.3416Z"
			fill="#D9D9D9"
			stroke="#E6DBDB"
		/>
	)
}

const getMouth = (_: ICharacter['mouth']): JSX.Element => {
	return <rect x="22.5" y="43.5" width="17" height="2" rx="1" fill="#D9D9D9" stroke="#E6DBDB" />
}
type Size = 's' | 'l'

const mapSizesToScale = (size: Size): number => {
	switch (size) {
		case `s`:
			return 1

		case `l`:
			return 1.85

		default:
			return 1
	}
}

export const Character: FC<{ size?: Size; onClick?: () => void; data: ICharacter }> = ({
	size = `s`,
	data,
	onClick = () => {},
}) => {
	return (
		<svg
			onClick={onClick}
			width={63}
			height={100}
			viewBox={`0 0 ${63} ${100}`}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={{
				transform: `scale(${mapSizesToScale(size)})`,
			}}
		>
			{getBody(data.body)}
			{getSculp(data.skulp)}
			{getLeftEye(data.eye.left)}
			{getRightEye(data.eye.right)}
			{getNose(data.nose)}
			{getMouth(data.mouth)}
		</svg>
	)
}

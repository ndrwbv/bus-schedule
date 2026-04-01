import React from 'react'

const overlayStyle: React.CSSProperties = {
	position: `absolute`,
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	display: `flex`,
	flexDirection: `column`,
	alignItems: `center`,
	justifyContent: `center`,
	backgroundColor: `rgba(255, 255, 255, 0.85)`,
	zIndex: 1,
	pointerEvents: `none`,
}

const spinnerStyle: React.CSSProperties = {
	width: 36,
	height: 36,
	border: `3px solid #e0e0e0`,
	borderTopColor: `#47daff`,
	borderRadius: `50%`,
	animation: `map-loader-spin 0.8s linear infinite`,
}

const textStyle: React.CSSProperties = {
	marginTop: 12,
	fontSize: 14,
	color: `#666`,
	fontFamily: `Roboto, sans-serif`,
}

const errorTextStyle: React.CSSProperties = {
	fontSize: 14,
	color: `#e53935`,
	fontFamily: `Roboto, sans-serif`,
}

interface MapLoaderProps {
	loading: boolean
	error: string | null
}

export const MapLoader: React.FC<MapLoaderProps> = ({ loading, error }) => {
	if (!loading && !error) return null

	return (
		<>
			<style>{`@keyframes map-loader-spin { to { transform: rotate(360deg); } }`}</style>
			<div style={overlayStyle}>
				{error ? (
					<p style={errorTextStyle}>{error}</p>
				) : (
					<>
						<div style={spinnerStyle} />
						<p style={textStyle}>Загрузка карты...</p>
					</>
				)}
			</div>
		</>
	)
}

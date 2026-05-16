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
	backgroundColor: `rgba(255, 255, 255, 0.95)`,
	zIndex: 1,
	padding: 24,
	boxSizing: `border-box`,
}

const loadingOverlayStyle: React.CSSProperties = {
	...overlayStyle,
	backgroundColor: `rgba(255, 255, 255, 0.85)`,
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

const errorIconStyle: React.CSSProperties = {
	fontSize: 32,
	lineHeight: 1,
	marginBottom: 12,
}

const errorTitleStyle: React.CSSProperties = {
	fontSize: 16,
	fontWeight: 600,
	color: `#e53935`,
	fontFamily: `Roboto, sans-serif`,
	margin: 0,
	textAlign: `center`,
	maxWidth: 320,
}

const errorDetailsStyle: React.CSSProperties = {
	marginTop: 8,
	fontSize: 13,
	color: `#666`,
	fontFamily: `Roboto, sans-serif`,
	textAlign: `center`,
	maxWidth: 320,
	wordBreak: `break-word`,
}

const retryButtonStyle: React.CSSProperties = {
	marginTop: 16,
	padding: `10px 20px`,
	fontSize: 14,
	fontFamily: `Roboto, sans-serif`,
	fontWeight: 500,
	color: `#fff`,
	backgroundColor: `#47daff`,
	border: `none`,
	borderRadius: 6,
	cursor: `pointer`,
}

interface MapLoaderProps {
	loading: boolean
	error: string | null
	onRetry?: () => void
}

export const MapLoader: React.FC<MapLoaderProps> = ({ loading, error, onRetry }) => {
	if (!loading && !error) return null

	if (error) {
		return (
			<div style={overlayStyle} role="alert">
				<div style={errorIconStyle} aria-hidden>
					⚠️
				</div>
				<p style={errorTitleStyle}>Не удалось загрузить карту</p>
				<p style={errorDetailsStyle}>{error}</p>
				{onRetry && (
					<button type="button" style={retryButtonStyle} onClick={onRetry}>
						Повторить
					</button>
				)}
			</div>
		)
	}

	return (
		<>
			<style>{`@keyframes map-loader-spin { to { transform: rotate(360deg); } }`}</style>
			<div style={loadingOverlayStyle}>
				<div style={spinnerStyle} />
				<p style={textStyle}>Загрузка карты...</p>
			</div>
		</>
	)
}

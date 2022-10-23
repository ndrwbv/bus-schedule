import React from 'react'

import { PopupStyles } from './styled'

export function cls(arr: string[]): string {
	return arr.filter(Boolean).join(' ')
}

export const Popup: React.FC<any> = ({ isOpen = false, handleClose, children, contentRef = null }) => {
	const [isClosing, setClose] = React.useState(false)

	const [active, setActive] = React.useState(false)
	const dragItem = React.useRef<any>(null)

	const [currentY, setCurrentY] = React.useState<any>(undefined)
	const [initialY, setInitialY] = React.useState<any>(undefined)
	const [yOffset, setYOffset] = React.useState(0)

	const onClose = () => {
		if (!isOpen) return

		setClose(true)
		handleClose()

		dragItem.current.style.transform = null
		dragItem.current.style.transition = null

		setTimeout(() => {
			setClose(false)

			resetPositions()
		}, 450)
	}

	const resetPositions = () => {
		setCurrentY(undefined)
		setInitialY(undefined)
		setYOffset(0)
	}

	function dragStart(e: any) {
		if (e.type === 'touchstart') {
			setInitialY(e.touches[0].clientY - yOffset)
		} else {
			setInitialY(e.clientY - yOffset)
		}

		const dragInPopup = dragItem.current.contains(e.target)
		const dragInContent = contentRef ? contentRef.current.contains(e.target) : false

		if (dragInPopup && !dragInContent) {
			setActive(true)
		}
	}

	function dragEnd(e: any) {
		if (!active) return

		setInitialY(currentY)
		setActive(false)

		if (currentY >= 80) {
			onClose()
		} else {
			// return to initial point
			setTranslate(0, 0, dragItem.current)
			resetPositions()
		}
	}

	function drag(e: any) {
		if (active) {
			// e.preventDefault();

			let pos = 0
			if (e.type === 'touchmove') {
				pos = e.touches[0].clientY - initialY
			} else {
				pos = e.clientY - initialY
			}

			if (pos < 0) pos = 0

			setCurrentY(pos)
			setYOffset(pos)

			setTranslate(0, pos, dragItem.current)
		}
	}

	function setTranslate(xPos = 0, yPos: number, el: any) {
		el.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)'
		el.style.transition = 'transform 0.1s ease'
	}

	React.useEffect(() => {
		if (isOpen) {
			document.body.classList.add('scroll-lock')
		} else {
			document.body.classList.remove('scroll-lock')
		}
	}, [isOpen])

	return (
		<PopupStyles>
			<div
				className={cls([
					'popup-container',
					isOpen && 'popup-container--open',
					isClosing && 'popup-container--closing',
				])}
				style={{ zIndex: isClosing || isOpen ? 30 : -1 }}
			>
				<div className={'popup-container__overlay'} onClick={onClose} />

				<div
					className={'popup'}
					ref={dragItem}
					onTouchStart={dragStart}
					onTouchEnd={dragEnd}
					onTouchMove={drag}
				>
					<div className={'popup__header'}>
						<span className={'popup__close'}></span>
					</div>

					{children}
				</div>
			</div>
		</PopupStyles>
	)
}

export const PopupWrapper: React.FC<{ children: any }> = ({ children }) => {
	return <div className={'popup-padding'}>{children}</div>
}

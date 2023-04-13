import { css } from 'styled-components';

export const clusterIconsCss = css`
	.cluster-icon {
		position: relative;
	}

	.cluster-icon__icon {
		display: flex;
	}

	.cluster-icon__amount-container {
		position: absolute;
		top: 0;
		left: 0;

		z-index: 9999;
		display: flex;

		justify-content: center;
		align-items: center;
		width: 100%;

		height: 100%;
		color: #fff;

		font-weight: bold;
		font-size: 30px;
	}

	.cluster-icon__amount-text {
		margin-bottom: 10px;
	}
`;
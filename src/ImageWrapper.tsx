import styled from "styled-components";

export const ImageWrapper = styled.div<{ w: number; h: number }>`
  width: ${(props) => `${props.w}px`};
  height: ${(props) => `${props.h}px`};
`;

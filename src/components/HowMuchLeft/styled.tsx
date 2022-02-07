import styled from "styled-components";
import { MAIN_GREY } from "../Schedule/consts";

export const HowMuchLeftContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;

  padding: 15px 17px;
  background-color: ${MAIN_GREY};
  border-radius: 6px;
`;

export const NextBusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const FastReplyContainer = styled.div`
  margin-top: 18px;
`;

export const TextWrapper = styled.p``;

export const HighLighted = styled.span`
  font-weight: bold;
`;

export const BusEstimation = styled.div`
  font-size: 18px;
  margin-left: 19px;
`;

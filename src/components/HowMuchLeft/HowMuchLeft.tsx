import React from "react";
import SVG from "react-inlinesvg";
import NextBus from "../../img/next-bus.svg";

import { ImageWrapper } from "../ImageWrapper";
import { StopKeys } from "../Schedule/consts";
import { ITime } from "../Schedule/helpers";
import {
  BusEstimation,
  HighLighted,
  HowMuchLeftContainer,
  TextWrapper,
} from "./styled";

const HowMuchLeft: React.FC<{ left: ITime; busStop: StopKeys }> = ({
  left,
  busStop,
}) => {
  const renderLeftToString = () => {
    if (left.hours === null && left.minutes === null)
      return (
        <TextWrapper>
          Автобус на остановку <b>{busStop}</b> сегодня не приедет
        </TextWrapper>
      );

    return (
      <TextWrapper>
        Следующий автобус приедет через{" "}
        <HighLighted>
          {left.hours === 0 ? "" : `${left.hours}ч `}
          {left.minutes}м
        </HighLighted>
      </TextWrapper>
    );
  };

  return (
    <HowMuchLeftContainer>
      <ImageWrapper w={39} h={39}>
        <SVG src={NextBus} width={39} height={39} uniquifyIDs={true} />
      </ImageWrapper>

      <BusEstimation>{renderLeftToString()}</BusEstimation>
    </HowMuchLeftContainer>
  );
};

export default HowMuchLeft;

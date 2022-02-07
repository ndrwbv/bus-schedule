import React from "react";
import SVG from "react-inlinesvg";
import { AndrewLytics } from "../../helpers";
import NextBus from "../../img/next-bus.svg";

import { ImageWrapper } from "../ImageWrapper";
import InlineOptions from "../InlineOptions";
import { StopKeys } from "../Schedule/consts";
import { ITime } from "../Schedule/helpers";
import SelectBusStopText from "../SelectBusStopText";
import {
  BusEstimation,
  FastReplyContainer,
  HighLighted,
  HowMuchLeftContainer,
  NextBusContainer,
  TextWrapper,
} from "./styled";

const FastReplyOptions = [
  {
    value: "Приехал раньше",
    label: "Приехал раньше",
  },
  {
    value: "Приехал позже",
    label: "Приехал позже",
  },
  {
    value: "Не приехал",
    label: "Не приехал",
  },
];

const HowMuchLeft: React.FC<{
  left: ITime;
  busStop: StopKeys | null;
  shouldShowFastReply: boolean;
}> = ({ left, busStop, shouldShowFastReply }) => {
  const [fastReplyOption, setFastReplyOption] = React.useState<string | null>(
    null
  );

  const handleClickOption = (value: string | number | null) => {
    AndrewLytics("fastReply")
    setFastReplyOption(value as string);
  };

  const renderLeftToString = () => {
    if (!busStop) return <SelectBusStopText />;
    
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
      <NextBusContainer>
        <ImageWrapper w={39} h={39}>
          <SVG src={NextBus} width={39} height={39} uniquifyIDs={true} />
        </ImageWrapper>

        <BusEstimation>{renderLeftToString()}</BusEstimation>
      </NextBusContainer>

      {shouldShowFastReply && (
        <FastReplyContainer>
          <InlineOptions
            list={FastReplyOptions}
            activeId={fastReplyOption}
            onClick={handleClickOption}
            defaultColor={"white"}
          />
        </FastReplyContainer>
      )}
    </HowMuchLeftContainer>
  );
};

export default HowMuchLeft;

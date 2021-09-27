import React from "react";

import styled from "styled-components";

import { SCHEDULE, StopKeys } from "./consts";
import {
  calculateHowMuchIsLeft,
  findClosesTime,
  findClosesTimeArray,
  ITime,
} from "./helpers";

const HowMuchLeftBlock = styled.div`
  padding: 20px;
  background-color: #0000ff21;
`;
const LinksBlock = styled.div`
  padding: 20px;
  background-color: #ffc80021;
`;
const BusEstimation = styled.div`
  font-size: 25px;
  font-weight: normal;
`;
const TextWrapper = styled.p``;
const HighLighted = styled.span`
  font-weight: bold;
  margin-left: 8px;
`;
const OtherTime = styled.div`
  padding: 20px;
  background-color: #00ff5a21;
`;
const TimeStamp = styled.p``;

const currentDay = new Date().getDay();

function Schedule() {
  const [busStop] = React.useState<StopKeys>("маяковского");
  const [left, setLeft] = React.useState<ITime>({
    hours: 0,
    minutes: 0,
  });
  const [closestTimeArray, setClossestTimeArray] = React.useState<string[]>([]);
  const [closestTime, setClossestTime] = React.useState<Date | null>(null);

  const [_everyMinuteUpdate, _setUpdate] = React.useState(0);

  React.useEffect(() => {
    console.log("in interval");
    const int = setInterval(() => _setUpdate(Date.now()), 1000);

    return () => {
      clearInterval(int);
    };
  }, [_everyMinuteUpdate]);

  React.useEffect(() => {
    const _closestTime = findClosesTime(SCHEDULE[currentDay][busStop]);

    console.log(
      "date",
      new Date(),
      _closestTime,
      SCHEDULE[currentDay][busStop]
    );
    if (
      _closestTime?.getMinutes() !== closestTime?.getMinutes() &&
      _closestTime?.getHours() !== closestTime?.getHours()
    ) {
      setClossestTimeArray(findClosesTimeArray(SCHEDULE[currentDay][busStop]));
      setClossestTime(_closestTime);
    }
  }, [_everyMinuteUpdate, closestTime, busStop]);

  React.useEffect(() => {
    const left = calculateHowMuchIsLeft(closestTime);

    setLeft(left);
  }, [_everyMinuteUpdate, closestTime]);

  const renderLeftToString = () => {
    if (left.hours === null && left.minutes === null)
      return (
        <TextWrapper>
          Автобус на остановку <b>{busStop}</b> сегодня не приедет
        </TextWrapper>
      );

    return (
      <TextWrapper>
        Следующий автобус приедет через
        <HighLighted>
          {left.hours}ч {left.minutes}м
        </HighLighted>
      </TextWrapper>
    );
  };

  return (
    <>
      <HowMuchLeftBlock>
        <BusEstimation>{renderLeftToString()}</BusEstimation>
      </HowMuchLeftBlock>

      <OtherTime>
        <TextWrapper>Время на сегодня:</TextWrapper>
        {closestTimeArray.map((d) => (
          <TimeStamp>{d}</TimeStamp>
        ))}
      </OtherTime>

      <LinksBlock>
        <a
          href="http://www.tomskavtotrans.ru/60"
          target="_blank"
          rel="noreferrer"
        >
          Расписание
        </a>
        <TextWrapper>День {currentDay}</TextWrapper>
      </LinksBlock>
    </>
  );
}

export default Schedule;

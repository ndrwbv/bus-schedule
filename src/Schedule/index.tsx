import React from "react";

import styled from "styled-components";
import SVG from "react-inlinesvg";
import Select from "react-select";

import { MAIN_GREY, SCHEDULE, StopKeys, Stops } from "./consts";
import {
  calculateHowMuchIsLeft,
  findClosesTime,
  findClosesTimeArray,
  ITime,
} from "./helpers";

import GreenHeart from "../img/green-heart.svg";
import BusStop from "../img/bus-stop.svg";
import NextBus from "../img/next-bus.svg";
import UpcomingBus from "../img/upcoming-bus.svg";
import Write from "../img/write.svg";

import FavoriteBusStopList from "../FavoriteBusStopList";
import Header from "../Header";
import { ImageWrapper } from "../ImageWrapper";
import TelegramButton from "../TelegramButton";

const MainLayout = styled.div`
  padding: 15px;
`;
const HowMuchLeftContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 15px 17px;
  background-color: ${MAIN_GREY};
  border-radius: 6px;
`;
const LinksBlock = styled.div``;
const BusEstimation = styled.div`
  font-size: 18px;
  margin-left: 19px;
`;
const TextWrapper = styled.p``;
const HighLighted = styled.span`
  font-weight: bold;
`;
const OtherTime = styled.div`
  padding: 22px 26px;
  background-color: ${MAIN_GREY};
  border-radius: 6px;
`;
const TimeStamp = styled.div`
  & + & {
    margin-top: 8px;
  }
`;

const GoButton = styled.button<{ active?: boolean }>`
  width: 100%;
  border: none;
  border-radius: 6px;
  background-color: ${(props) => (props.active ? "#336CFF" : MAIN_GREY)};
  color: ${(props) => (props.active ? "white" : "black")};
  padding: 12px 17px;

  & + & {
    margin-left: 10px;
  }
`;

type FavoriteButtonStatuses = "add" | "remove";
const AddToFavoriteButton = styled.button<{ status: FavoriteButtonStatuses }>`
  width: 100%;
  border: none;
  border-radius: 6px;
  background-color: ${(props) =>
    props.status === "add" ? "#6BD756" : "#D75656"};
  color: white;
  padding: 12px 17px;

  margin-top: 8px;
`;
const GoButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;
const Container = styled.div`
  & + & {
    margin-top: 44px;
  }
`;

const GrayText = styled.p`
  margin: 0;
  color: #b2b2b2;
  font-size: 12px;
  a {
    color: inherit;
  }

  & + & {
    margin-top: 12px;
  }
`;

const TelegramContainer = styled.div`
  padding-left: 31px;
`;

const currentDay = new Date().getDay();

type Directions = "in" | "out";

function Schedule() {
  const [busStop, setBusStop] = React.useState<StopKeys>("В. Маяковского");
  const [left, setLeft] = React.useState<ITime>({
    hours: 0,
    minutes: 0,
  });
  const [closestTimeArray, setClossestTimeArray] = React.useState<string[]>([]);
  const [closestTime, setClossestTime] = React.useState<Date | null>(null);

  const [_everyMinuteUpdate, _setUpdate] = React.useState(0);
  const [direction, setDirection] = React.useState<Directions>("in");
  const [favoriteBusStops, setFavoriteBusStops] = React.useState([]);

  React.useEffect(() => {
    const int = setInterval(() => _setUpdate(Date.now()), 1000);

    return () => {
      clearInterval(int);
    };
  }, [_everyMinuteUpdate]);

  React.useEffect(() => {
    const _closestTime = findClosesTime(SCHEDULE[currentDay][busStop]);

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
        Следующий автобус приедет через{" "}
        <HighLighted>
          {left.hours === 0 ? "" : `${left.hours}ч `}
          {left.minutes}м
        </HighLighted>
      </TextWrapper>
    );
  };

  const handleChangeFavoriteStatus = () => {
    // todo
  };

  return (
    <MainLayout>
      <Container>
        <GoButtonContainer>
          <GoButton
            active={direction === "in"}
            onClick={() => setDirection("in")}
          >
            в сторону парка
          </GoButton>
          <GoButton
            active={direction === "out"}
            onClick={() => setDirection("out")}
          >
            из парка
          </GoButton>
        </GoButtonContainer>
      </Container>

      <Container>
        <Header text={"Мои остановки"} imgSrc={GreenHeart} />
        <FavoriteBusStopList
          stopList={[
            { id: "d", label: "В. маяк" },
            { id: "v", label: "ТГУ" },
          ]}
          activeId={"d"}
        />
      </Container>

      <Container>
        <Header text={"Остановка"} imgSrc={BusStop}>
          <Select
            options={Stops}
            onChange={(e) => setBusStop(e?.value as StopKeys)}
            defaultValue={Stops[0]}
          />
        </Header>

        <HowMuchLeftContainer>
          <ImageWrapper w={39} h={39}>
            <SVG src={NextBus} width={39} height={39} uniquifyIDs={true} />
          </ImageWrapper>

          <BusEstimation>{renderLeftToString()}</BusEstimation>
        </HowMuchLeftContainer>
      </Container>

      <Container>
        <Header text={"Ещё автобусы на сегодня"} imgSrc={UpcomingBus} />

        <OtherTime>
          {closestTimeArray.length === 0
            ? "Автобусов на сегодня нет"
            : closestTimeArray.map((d) => <TimeStamp key={d}>{d}</TimeStamp>)}
        </OtherTime>

        <AddToFavoriteButton
          status={"add"}
          onClick={handleChangeFavoriteStatus}
        >
          Добавить остановку в избранное
        </AddToFavoriteButton>
      </Container>

      <Container>
        <Header
          text={() => (
            <>
              Увидели ошибку?
              <br />
              Есть предложение по улучшению?
            </>
          )}
          imgSrc={Write}
        />

        <TelegramContainer>
          <TelegramButton />
        </TelegramContainer>
      </Container>

      <Container>
        <LinksBlock>
          <GrayText>
            Расписание взято с сайта{" "}
            <a
              href="http://www.tomskavtotrans.ru/60"
              target="_blank"
              rel="noreferrer"
            >
              tomskavtotrans.ru
            </a>
          </GrayText>

          <GrayText>© Andrew Boev</GrayText>
        </LinksBlock>
      </Container>
    </MainLayout>
  );
}

export default Schedule;

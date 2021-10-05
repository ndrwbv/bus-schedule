import React from "react";

import styled from "styled-components";
import SVG from "react-inlinesvg";
import Select from "react-select";

import {
  Directions,
  IStop,
  MAIN_GREY,
  SCHEDULE,
  StopKeys,
  StopKeysIn,
  StopKeysOut,
  StopsInOptions,
  StopsOutOptions,
} from "./consts";
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

const selectStyles = {
  container: (p: any, s: any) => ({
    ...p,
    width: "200px",
  }),
};

const GoButton = styled.button<{ active?: boolean }>`
  width: 100%;
  border: none;
  border-radius: 6px;
  background-color: ${(props) => (props.active ? "#336CFF" : MAIN_GREY)};
  color: ${(props) => (props.active ? "white" : "black")};
  padding: 12px 10px;

  & + & {
    margin-left: 6px;
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

function Schedule() {
  const [busStop, setBusStop] = React.useState<StopKeys>("В. Маяковского");
  const [left, setLeft] = React.useState<ITime>({
    hours: 0,
    minutes: 0,
  });
  const [closestTimeArray, setClossestTimeArray] = React.useState<string[]>([]);
  const [closestTime, setClossestTime] = React.useState<string>("");

  const [_everyMinuteUpdate, _setUpdate] = React.useState(0);
  const [direction, setDirection] = React.useState<Directions>("in");
  const [favoriteBusStops, setFavoriteBusStops] = React.useState<StopKeys[]>(
    []
  );
  const [stopsOptions, setStopsOptions] =
    React.useState<IStop<StopKeysIn | StopKeysOut>[]>(StopsInOptions);

  React.useEffect(() => {}, []);

  React.useEffect(() => {
    const localStorageItem = localStorage.getItem("favoriteStops");
    const favoriteStops = localStorageItem ? JSON.parse(localStorageItem) : [];

    setFavoriteBusStops(favoriteStops);
  }, []);

  React.useEffect(() => {
    const int = setInterval(() => _setUpdate(Date.now()), 1000);

    return () => {
      clearInterval(int);
    };
  }, [_everyMinuteUpdate]);

  React.useEffect(() => {
    const _closestTime = findClosesTime(
      SCHEDULE[direction][currentDay][busStop]
    );

    if (!_closestTime) return;

    if (
      !closestTime ||
      new Date(closestTime).getTime() !== new Date(_closestTime).getTime()
    ) {
      setClossestTimeArray(
        findClosesTimeArray(SCHEDULE[direction][currentDay][busStop])
      );
      setClossestTime(_closestTime);
    }
  }, [_everyMinuteUpdate, closestTime, busStop, direction]);

  React.useEffect(() => {
    const left = calculateHowMuchIsLeft(closestTime);

    setLeft(left);
  }, [_everyMinuteUpdate, closestTime]);

  const handleChangeDirection = (_direction: Directions) => {
    const scheduleKeys = Object.keys(SCHEDULE[_direction][currentDay]);
    if (!scheduleKeys.includes(busStop)) {
      setBusStop(scheduleKeys[0] as StopKeys);
    }

    setStopsOptions(_direction === "in" ? StopsInOptions : StopsOutOptions);
    setDirection(_direction);
  };

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

  const saveFavoriteBusStops = (stops: StopKeys[]) => {
    setFavoriteBusStops(stops);
    localStorage.setItem("favoriteStops", JSON.stringify(stops));
  };

  const getFavoriteBusStop = (): StopKeys[] => {
    const localStorageItem = localStorage.getItem("favoriteStops");
    const favoriteStops = localStorageItem ? JSON.parse(localStorageItem) : [];

    return favoriteStops;
  };

  const handleAddFavoriteStatus = () => {
    const stops = getFavoriteBusStop();

    if (stops.includes(busStop)) return;

    const newStops: StopKeys[] = [busStop, ...stops];
    saveFavoriteBusStops(newStops);
  };

  const handleRemoveFavoriteStatus = () => {
    const stops = getFavoriteBusStop();

    if (!stops.includes(busStop)) return;

    const newStops: StopKeys[] = stops.filter((stop) => stop !== busStop);

    saveFavoriteBusStops(newStops);
  };

  const isBusStopFavorite = favoriteBusStops.includes(busStop);

  return (
    <MainLayout>
      <Container>
        <GoButtonContainer>
          <GoButton
            active={direction === "in"}
            onClick={() => handleChangeDirection("in")}
          >
            в северный парк
          </GoButton>
          <GoButton
            active={direction === "out"}
            onClick={() => handleChangeDirection("out")}
          >
            из северного парка
          </GoButton>
        </GoButtonContainer>
      </Container>

      <Container>
        <Header text={"Мои остановки"} imgSrc={GreenHeart} />
        <FavoriteBusStopList
          stopList={stopsOptions.filter((stop) =>
            favoriteBusStops.includes(stop.value)
          )}
          activeId={busStop}
          onClick={(busStop) => setBusStop(busStop)}
        />
      </Container>

      <Container>
        <Header text={"Остановка"} imgSrc={BusStop}>
          <Select
            styles={selectStyles}
            options={stopsOptions}
            onChange={(e) => setBusStop(e?.value as StopKeys)}
            value={stopsOptions.find((stop) => stop.value === busStop)}
            defaultValue={stopsOptions[0]}
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
            : closestTimeArray.map((d, index) => (
                <TimeStamp key={`${d}-${index}`}>{d}</TimeStamp>
              ))}
        </OtherTime>

        <AddToFavoriteButton
          status={isBusStopFavorite ? "remove" : "add"}
          onClick={
            isBusStopFavorite
              ? handleRemoveFavoriteStatus
              : handleAddFavoriteStatus
          }
        >
          {isBusStopFavorite
            ? "Удалить остановку из избранного"
            : "Добавить остановку в избранное"}
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

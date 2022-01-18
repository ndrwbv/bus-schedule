import React from "react";

import SVG from "react-inlinesvg";
import Select from "react-select";

import {
  Directions,
  IStop,
  SCHEDULE as defaultSCHEDULE,
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
  getNextDay,
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
import ym from "react-yandex-metrika";
import Vote from "../Vote";
import {
  AddToFavoriteButton,
  BusEstimation,
  Container,
  GoButton,
  GoButtonContainer,
  GrayText,
  HighLighted,
  HowMuchLeftContainer,
  LinksBlock,
  MainLayout,
  OtherTime,
  selectStyles,
  StyledHR,
  TelegramContainer,
  TextWrapper,
  TimeStamp,
} from "./styled";

const currentDay = new Date().getDay();
const nextDay = getNextDay(currentDay);

const isProd = process.env.NODE_ENV === "production";

function Schedule() {
  const [busStop, setBusStop] = React.useState<StopKeys>("В. Маяковского");
  const [left, setLeft] = React.useState<ITime>({
    hours: 0,
    minutes: 0,
  });
  const [closestTimeArray, setClossestTimeArray] = React.useState<string[]>([]);
  const [closestTime, setClossestTime] = React.useState<string>("");

  const [_everyMinuteUpdate, _setUpdate] = React.useState(0);
  const [direction, setDirection] = React.useState<Directions>("out");
  const [favoriteBusStops, setFavoriteBusStops] = React.useState<StopKeys[]>(
    []
  );
  const [stopsOptions, setStopsOptions] =
    React.useState<IStop<StopKeysIn | StopKeysOut>[]>(StopsOutOptions);

  const [SCHEDULE, setSchedule] = React.useState(defaultSCHEDULE);

  React.useEffect(() => {
    fetch(
      "https://cdn.contentful.com/spaces/jms7gencs5gy/environments/master/entries/43nolroEBc5PNSMub6VR8G?access_token=qhkzg59i5IhlhFYUg-N4Pc9Qm1Dfx63wlGkOwOGhPXg"
    )
      .then((res) => res.json())
      .then((res) => {
        if (res?.fields?.schedule) {
          setSchedule(res?.fields?.schedule);
        } else {
          isProd && ym("reachGoal", "cannotLoad");
        }
      })
      .catch(() => {
        isProd && ym("reachGoal", "cannotLoad");
      });
  }, []);

  React.useEffect(() => {
    const utmIndex = window.location.href.indexOf("utm");
    if (utmIndex === -1) return;

    const localStorageUtm = localStorage.getItem("utm");
    if (localStorageUtm) return;

    const utm = window.location.href.slice(utmIndex + 4);

    localStorage.setItem("utm", utm);
    isProd && ym("reachGoal", "fromUtm", { utm });
  }, []);

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
  }, [_everyMinuteUpdate, closestTime, busStop, direction, SCHEDULE]);

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

  const handleVoteClick = () => {
    isProd && ym("reachGoal", "voteClick");
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
    isProd && ym("reachGoal", "addStop", { stop: busStop });
  };

  const handleRemoveFavoriteStatus = () => {
    const stops = getFavoriteBusStop();

    if (!stops.includes(busStop)) return;

    const newStops: StopKeys[] = stops.filter((stop) => stop !== busStop);

    saveFavoriteBusStops(newStops);
  };

  const handleChangeBusStop = (busStop: StopKeys) => {
    isProd && ym("reachGoal", "selectBusStop");
    setBusStop(busStop);
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
        <Header text={"Остановка"} imgSrc={BusStop}>
          <Select
            isSearchable={false}
            styles={selectStyles}
            options={stopsOptions}
            onChange={(e) => handleChangeBusStop(e?.value as StopKeys)}
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
        <StyledHR/>
      </Container>

      <Container>
        <Header text={"Ещё автобусы на сегодня"} imgSrc={UpcomingBus} />

        <OtherTime>
          {closestTimeArray.length === 0
            ? "Автобусов нет"
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
        <Vote key={2} hideCross={true} onVoteClick={handleVoteClick} />
      </Container>

      <Container>
        <Header text={"Автобусы на завтра"} imgSrc={UpcomingBus} />

        <OtherTime>
          {SCHEDULE[direction][nextDay][busStop]?.map((d, index) => (
            <TimeStamp key={`${d}-${index}`}>{d}</TimeStamp>
          ))}
        </OtherTime>
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

          <GrayText>© Andrew Boev & Friends</GrayText>
        </LinksBlock>
      </Container>
    </MainLayout>
  );
}

export default Schedule;

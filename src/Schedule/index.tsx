import React from "react";

import styled from "styled-components";

import { SCHEDULE, StopKeys, Stops } from "./consts";
import {
  calculateHowMuchIsLeft,
  findClosesTime,
  findClosesTimeArray,
  ITime,
} from "./helpers";
import GreenHeart from "../img/green-heart.svg";
import BusStop from "../img/bus-stop.svg";
import NextBus from "../img/next-bus.svg";
import TelegramLogo from "../img/telegram-logo.svg";
import UpcomingBus from "../img/upcoming-bus.svg";
import Write from "../img/write.svg";

import SVG, { Props as SVGProps } from "react-inlinesvg";

const MAIN_GREY = "#F4F4F4";
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
  margin-left: 8px;
`;
const OtherTime = styled.div`
  padding: 22px 26px;
  background-color: ${MAIN_GREY};
  border-radius: 6px;
`;
const TimeStamp = styled.p``;

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

const currentDay = new Date().getDay();

const Icon = styled.img<{ src: any }>``;
const ImageWrapper = styled.div<{ w: number; h: number }>`
  width: ${(props) => `${props.w}px`};
  height: ${(props) => `${props.h}px`};
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;
const HeaderText = styled.h1`
  font-size: 16px;
  font-weight: normal;
  margin-left: 8px;
`;
const HeaderItem = styled.div`
  display: flex;
  align-items: center;
`;
interface IHeaderProps {
  text: string;
  imgSrc: any;
  children?: React.ReactNode;
}
const Header: React.FC<IHeaderProps> = ({ text, imgSrc, children = null }) => {
  return (
    <HeaderContainer>
      <HeaderItem>
        <ImageWrapper w={20} h={20}>
          <SVG
            src={imgSrc}
            width={20}
            height="auto"
            title="Menu"
            uniqueHash={text}
            uniquifyIDs={true}
          />
          {/* <Icon src={imgSrc}></Icon> */}
        </ImageWrapper>

        <HeaderText>{text}</HeaderText>
      </HeaderItem>

      {children && <HeaderItem>{children}</HeaderItem>}
    </HeaderContainer>
  );
};

const FavoriteBusStopItem = styled.div<{ active: boolean }>`
  padding: 8px 17px;
  border-radius: 30px;
  background-color: ${(props) => (props.active ? "#336CFF" : MAIN_GREY)};
  color: ${(props) => (props.active ? "white" : "black")};

  & + & {
    margin-left: 12px;
  }
`;
const FavoriteBusStopContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;
const FavoriteBusStopList: React.FC<{
  stopList: { id: string; label: string }[];
  activeId: string;
}> = ({ stopList, activeId }) => {
  return (
    <FavoriteBusStopContainer>
      {stopList.map((stop) => (
        <FavoriteBusStopItem active={stop.id === activeId}>
          {stop.label}
        </FavoriteBusStopItem>
      ))}
    </FavoriteBusStopContainer>
  );
};

const TelegramContainer = styled.button`
  display: flex;
  align-items: center;
  padding: 8px;
  color: #26a4e3;
  border: 1px solid #26a4e3;
  background-color: white;
  border-radius: 6px;
`;
const TelegramText = styled.p`
  color: #26a4e3;
  margin: 0 0 0 10px;
`;
const TelegramButton = () => {
  return (
    <TelegramContainer>
      <ImageWrapper w={20} h={20}>
        <SVG
          src={TelegramLogo}
          width={20}
          height="auto"
          title="Menu"
          uniquifyIDs={true}
        />
        {/* <Icon src={TelegramLogo}></Icon> */}
      </ImageWrapper>

      <TelegramText>Написать в телеграм</TelegramText>
    </TelegramContainer>
  );
};
function Schedule() {
  const [busStop, setBusStop] = React.useState<StopKeys>("В. Маяковского");
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
    <MainLayout>
      <Container>
        <GoButtonContainer>
          <GoButton active>еду в сторону парка</GoButton>
          <GoButton>еду из парка</GoButton>
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
          <select onChange={(e) => setBusStop(e.target.value as StopKeys)}>
            {Stops.map((stop) => (
              <option value={stop.value}>{stop.label}</option>
            ))}
          </select>
        </Header>

        <HowMuchLeftContainer>
          <ImageWrapper w={29} h={29}>
            <SVG
              src={NextBus}
              width={29}
              height="auto"
              title="Menu"
              uniquifyIDs={true}
            />
            {/* <Icon src={NextBus}></Icon> */}
          </ImageWrapper>

          <BusEstimation>{renderLeftToString()}</BusEstimation>
        </HowMuchLeftContainer>
      </Container>

      <Container>
        <Header text={"Ещё автобусы на сегодня"} imgSrc={UpcomingBus} />

        <OtherTime>
          {closestTimeArray.length === 0
            ? "Автобусов на сегодня нет"
            : closestTimeArray.map((d) => <TimeStamp>{d}</TimeStamp>)}
        </OtherTime>
      </Container>

      <Container>
        <Header
          text={"Увидели ошибку? Есть предложение по улучшению?"}
          imgSrc={Write}
        />

        <TelegramButton />
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

import styled from "styled-components";
import { IStop, MAIN_GREY, StopKeys } from "./Schedule/consts";

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
  stopList: IStop<any>[];
  activeId: string;
  onClick: (busStop: StopKeys) => void;
}> = ({ stopList, activeId, onClick }) => {
  return (
    <FavoriteBusStopContainer>
      {stopList.map((stop) => (
        <FavoriteBusStopItem
          active={stop.value === activeId}
          key={stop.value}
          onClick={() => onClick(stop.value)}
        >
          {stop.label}
        </FavoriteBusStopItem>
      ))}
    </FavoriteBusStopContainer>
  );
};

export default FavoriteBusStopList;

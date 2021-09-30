import styled from "styled-components";
import { MAIN_GREY } from "./Schedule/consts";

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
        <FavoriteBusStopItem active={stop.id === activeId} key={stop.id}>
          {stop.label}
        </FavoriteBusStopItem>
      ))}
    </FavoriteBusStopContainer>
  );
};

export default FavoriteBusStopList;

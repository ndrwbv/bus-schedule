import { IOption, StopKeys } from "interfaces/Stops";
import { InlineOptionsContainer, InlineOptionsItem } from "./InlineOptions/styled";

const FavoriteBusStopList: React.FC<{
  stopList: IOption<any>[];
  activeId: string | null;
  onClick: (busStop: StopKeys) => void;
}> = ({ stopList, activeId, onClick }) => {
  return (
    <InlineOptionsContainer>
      {stopList.map((stop) => (
        <InlineOptionsItem
          active={stop.value === activeId}
          key={stop.value}
          onClick={() => onClick(stop.value)}
        >
          {stop.label}
        </InlineOptionsItem>
      ))}
    </InlineOptionsContainer>
  );
};

export default FavoriteBusStopList;

import { IStop, StopKeys } from "interfaces/Stops";
import { InlineOptionsContainer, InlineOptionsItem } from "./InlineOptions";

const FavoriteBusStopList: React.FC<{
  stopList: IStop<any>[];
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

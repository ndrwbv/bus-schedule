import { MAIN_BLUE, MAIN_GREY } from "consts/colors";
import { IStop } from "interfaces/Stops";
import styled from "styled-components";

export const InlineOptionsItem = styled.div<{
  active: boolean;
  defaultColor?: string | undefined;
}>`
  cursor: pointer;
  padding: 8px 17px;
  border-radius: 30px;
  background-color: ${(props) =>
    props.active ? MAIN_BLUE : props.defaultColor ?? MAIN_GREY};
  color: ${(props) => (props.active ? "white" : "black")};
  margin-top: 12px;

  & + & {
    margin-left: 12px;
  }
`;

export const InlineOptionsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const InlineOptions: React.FC<{
  list: IStop<string | number | null>[];
  activeId: string | null;
  onClick: (busStop: string | number | null) => void;
  defaultColor?: string;
}> = ({ list, activeId, onClick, defaultColor = undefined }) => {
  return (
    <InlineOptionsContainer>
      {list.map((option) => (
        <InlineOptionsItem
          active={option.value === activeId}
          defaultColor={defaultColor}
          key={option.value}
          onClick={() => onClick(option.value)}
        >
          {option.label}
        </InlineOptionsItem>
      ))}
    </InlineOptionsContainer>
  );
};

export default InlineOptions;

import styled from "styled-components";
import { IOption, MAIN_GREY } from "./Schedule/consts";

export const InlineOptionsItem = styled.div<{
  active: boolean;
  defaultColor: string | undefined;
}>`
  padding: 8px 17px;
  border-radius: 30px;
  background-color: ${(props) =>
    props.active ? "#336CFF" : props.defaultColor ?? MAIN_GREY};
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
  list: IOption<string | number>[];
  activeId: string | null;
  onClick: (busStop: string | number) => void;
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

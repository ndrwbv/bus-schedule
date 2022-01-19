import styled from "styled-components";
import { MAIN_GREY } from "./Schedule/consts";

export const InlineOptionsItem = styled.div<{ active: boolean }>`
  padding: 8px 17px;
  border-radius: 30px;
  background-color: ${(props) => (props.active ? "#336CFF" : MAIN_GREY)};
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

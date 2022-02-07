import styled from "styled-components";
import { MAIN_GREY } from "./consts";

export const MainLayout = styled.div`
  padding: 15px;
  max-width: 1024px;
  width: 100%;
`;

export const LinksBlock = styled.div``;

export const StyledHR = styled.hr`
  opacity: 0.3;
  margin: 0;
`;

export const OtherTime = styled.div`
  padding: 22px 26px;
  background-color: ${MAIN_GREY};
  border-radius: 6px;
  max-height: 200px;
  overflow-y: scroll;
`;
export const TimeStamp = styled.div`
  & + & {
    margin-top: 8px;
  }
`;

export const selectStyles = {
  container: (p: any, s: any) => ({
    ...p,
    width: "200px",
  }),
};

export const GoButton = styled.button<{ active?: boolean }>`
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

export type FavoriteButtonStatuses = "add" | "remove";
export const AddToFavoriteButton = styled.button<{
  status: FavoriteButtonStatuses;
}>`
  width: 100%;
  border: none;
  border-radius: 6px;
  background-color: ${(props) =>
    props.status === "add" ? "#6BD756" : "#D75656"};
  color: white;
  padding: 12px 17px;

  margin-top: 8px;
`;
export const GoButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;
export const Container = styled.div`
  & + & {
    margin-top: 44px;
  }
`;

export const GrayText = styled.p`
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

export const TelegramContainer = styled.div`
  padding-left: 31px;
`;

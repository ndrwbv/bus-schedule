import SVG from "react-inlinesvg";
import styled from "styled-components";

import { ImageWrapper } from "./ImageWrapper";
import TelegramLogo from "./img/telegram-logo.svg";

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
          height={20}
          title="Menu"
          uniquifyIDs={true}
        />
      </ImageWrapper>

      <TelegramText>Написать в телеграм</TelegramText>
    </TelegramContainer>
  );
};

export default TelegramButton;

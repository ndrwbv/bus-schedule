import styled from "styled-components";
import SVG from "react-inlinesvg";

import { ImageWrapper } from "./ImageWrapper";

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;
const HeaderText = styled.h1`
  font-size: 17px;
  font-weight: normal;
  margin-left: 8px;
`;
const HeaderItem = styled.div`
  display: flex;
  align-items: center;
`;

interface IHeaderProps {
  text: string | any;
  imgSrc: any;
  children?: React.ReactNode;
}

const Header: React.FC<IHeaderProps> = ({
  text: Text,
  imgSrc,
  children = null,
}) => {
  return (
    <HeaderContainer>
      <HeaderItem>
        <ImageWrapper w={23} h={23}>
          <SVG src={imgSrc} width={23} height={23} uniquifyIDs={true} />
        </ImageWrapper>

        <HeaderText>{typeof Text === "string" ? Text : <Text />}</HeaderText>
      </HeaderItem>

      {children && <HeaderItem>{children}</HeaderItem>}
    </HeaderContainer>
  );
};

export default Header;

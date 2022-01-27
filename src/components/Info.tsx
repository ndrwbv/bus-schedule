import styled from "styled-components";
import SVG from "react-inlinesvg";
import InfoCloseCross from "../img/infoclosecross.svg";

export const InfoWrapper = styled.div`
  width: 100%;
  padding: 15px 30px 15px 15px;

  background: linear-gradient(100.09deg, #0374f9 -39.57%, #35e0ff 124.36%);
  box-shadow: 0px 1px 22px -4px rgba(14, 139, 251, 0.46);
  border-radius: 18px;

  position: relative;
`;

export const InfoText = styled.p`
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 19px;

  color: #ffffff;
`;

export const InfoLink = styled.a`
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 19px;

  text-decoration: underline;
  color: #ffffff;

  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

export const InfoCloseButton = styled.div`
  position: absolute;
  top: 9px;
  right: 9px;

  height: 22px;
  width: 22px;

  background: rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  cursor: pointer;

  .closebutton {
    position: absolute;
    top: 5px;
    left: 5px;
  }
`;

const Info: React.FC<{
  onLinkClick: () => void;
  text: string | null;
  link: string | null;
  onInfoCrossClick: () => void;
}> = ({ onLinkClick, onInfoCrossClick, text, link }) => {
  if (!text) return null;

  return (
    <InfoWrapper>
      {link ? (
        <InfoLink href={link} target="_blank" onClick={onLinkClick}>
          {text}
        </InfoLink>
      ) : (
        <InfoText>{text}</InfoText>
      )}
      <InfoCloseButton>
        <SVG
          className="closebutton"
          src={InfoCloseCross}
          onClick={onInfoCrossClick}
        />
      </InfoCloseButton>
    </InfoWrapper>
  );
};

export default Info;

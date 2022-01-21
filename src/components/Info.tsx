import styled from "styled-components";
import SVG from "react-inlinesvg";
import InfoCloseCross from "../img/infoclosecross.svg";

export const InfoWrapper = styled.div`
  width: 100%;
  padding: 15px 30px 15px 15px;

  background: linear-gradient(100.09deg, #0374F9 -39.57%, #35E0FF 124.36%);
  box-shadow: 0px 1px 22px -4px rgba(14, 139, 251, 0.46);
  border-radius: 18px;
  
  position: relative;
`;

export const InfoText = styled.div`
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 19px;

  color: #ffffff;
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

const Info: React.FC<{}> = ({}) => {
  return (
    <InfoWrapper>
      <InfoText>С 1 по 10 января автобус ходит по субботнему расписанию</InfoText>
      <InfoCloseButton>
        <SVG className="closebutton" src={InfoCloseCross} />
      </InfoCloseButton>
    </InfoWrapper>
  );
};

export default Info;

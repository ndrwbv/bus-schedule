import styled from "styled-components";
import SVG from "react-inlinesvg";
import VoteCloseCross from "./img/voteclosecross.svg";

export const VoteWrapper = styled.div`
  background: linear-gradient(91.01deg, #0374f9 -21.64%, #35e0ff 97.87%);
  box-shadow: 0px 1px 22px -4px rgba(14, 139, 251, 0.46);
  border-radius: 8px;
  padding: 14px;
  width: 100%;
  height: 67px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
  position: relative;
  margin-top: 50px;
`;

export const VoteText = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 19px;
  color: #ffffff;
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const VoteButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #336cff;
  border-radius: 6px;
  padding: 13px 27px 13px 27px;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 19px;
  color: #ffffff;
  width: 50%;
  outline: none;
  cursor: pointer;
`;

export const VoteCloseButton = styled.div`
  width: 27px;
  height: 27px;
  position: absolute;
  background: rgba(255, 255, 255, 0.92);
  top: -10px;
  left: -10px;
  border-radius: 50px;
  outline: none;
  cursor: pointer;

  .closebutton {
    position: absolute;
    top: 6px;
    left: 6px;
  }
`;

const Vote: React.FC<{ hideCross: boolean }> = ({ hideCross }) => {
  return (
    <VoteWrapper>
      <VoteText>Хочу улучшить приложение</VoteText>
      <VoteButton
        href="https://docs.google.com/forms/d/1CIuACPCB373hVzxHdHsXbjFCkeEA2H7h7IK-CURqh2o/viewform?edit_requested=true"
        target="_blank"
      >
        Пройти опрос
      </VoteButton>
      {!hideCross && (
        <VoteCloseButton
          onClick={() => {
            console.log("erga");
          }}
        >
          <SVG className="closebutton" src={VoteCloseCross} />
        </VoteCloseButton>
      )}
    </VoteWrapper>
  );
};

export default Vote;

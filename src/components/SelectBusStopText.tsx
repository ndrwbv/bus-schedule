import styled from "styled-components";

const TextContainer = styled.p`
  opacity: 0.5;
  font-size: 18px;
`;

const SelectBusStopText = () => {
  return (
    <TextContainer>
      Выбери остановку, чтобы увидеть ближайший автобус
    </TextContainer>
  );
};

export default SelectBusStopText;

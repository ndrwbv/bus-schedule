import styled from "styled-components";
import Schedule from "./components/Schedule/Schedule";

const AppContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

function App() {
  return (
    <AppContainer>
      <Schedule />
    </AppContainer>
  );
}

export default App;

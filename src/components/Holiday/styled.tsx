import styled from "styled-components";

export const HolidayContainer = styled.div`
    position: relative;
    display: flex;
    margin-left: 12px;

    &::before {
        content: "";
        position: absolute;
        top: 4px;
        left: -17px;
        width: 12px;
        height: 12px;
        background: red;
        border-radius: 50%;
    }
`
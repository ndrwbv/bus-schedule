import styled from "styled-components";

export const PopupStyles = styled.div`
.popup-padding {
  padding: 0 24px;

  @media all and (min-width: 1024px) {
    padding: 0 24px;
  }
}

.popup {
  position: absolute;
  bottom: 0;

  height: 67vh;
  max-height: 479px;

  width: 100%;

  padding: 30px 0 0 0;
  z-index: 30;

  background-color: #fff;
  border-radius: 26px 26px 0 0;
  text-align: center;

  transition: transform 0.5s ease;
  transform: translate3d(0, 150%, 0);

  display: flex;
  flex-direction: column;

  .popup__sub-text {
    margin-top: 24px;
    font-weight: 400;
    color: #b8bac0;
  }

  h1 {
    font-weight: bold;
    font-size: 40px;
  }

  h2 {
    font-weight: 600;
    text-align: left;
    font-size: 24px;
  }

  @media all and (min-width: 1024px) {
    max-width: 742px;
    // max-height: 644px;
    bottom: unset;

    border-radius: 15px;
    transition: transform 0.3s ease;

    padding: 27px 0 0 0;
  }
}

.popup__header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 20px;

  text-align: center;

  @media all and (min-width: 1024px) {
    display: none;
  }
}

.popup__close {
  position: absolute;
  top: 13px;
  left: 48%;
  width: 34px;
  height: 3px;

  border-radius: 10px;
}

.popup-container__overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 10;

  background: #000000;

  opacity: 0.001;
  transition: opacity 0.5s ease;
}

.popup-container {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;

  z-index: -1;

  @media all and (min-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.popup-container--closing {
  z-index: 100;
}
.popup-container--open {
  z-index: 100;

  .popup {
    opacity: 1;
    transform: translate(0, 0);
  }

  .popup-container__overlay {
    opacity: 0.8;
  }
}

.popup__btn {
  font-weight: bold;
  font-size: 12px;

  margin-top: 25px;
  padding: 6px 10px;

  color: #3068f9;
  background-color: #3068f9;
  border-radius: 15px;
}

.popup__terms-condition {
  font-size: 12px;
  margin-top: 25px;
  color: #6f6e6f;
}

.popup-close {
  position: absolute;
  top: -50px;
  right: -50px;
}

.social-list {
  margin-top: 32px;
}
`
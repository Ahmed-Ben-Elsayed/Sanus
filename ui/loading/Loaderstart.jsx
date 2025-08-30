import React from 'react';
import styled from 'styled-components';

const Loaderstart = () => {
  return (
    <StyledWrapper>
      <div className="loader" />
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255,255,255,0.8); /* يمكنك تغييره إلى  أو داكن */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  .loader {
    width: 100px;
    height: 20px;
    box-shadow: 0 3px 0 #536C7A;
    position: relative;
    clip-path: inset(-40px 0 -5px);
  }

  .loader:before {
    content: "";
    position: absolute;
    inset: auto calc(50% - 17px) 0;
    height: 50px;
    --g: no-repeat linear-gradient(#536C7A 0 0);
    background: var(--g), var(--g), var(--g), var(--g);
    background-size: 16px 14px;
    animation:
      move 2s infinite linear,
      move2 2s infinite linear;
  }

  @keyframes move {
    0%, 100% {
      background-position: 0 -50px, 100% -50px;
    }
    17.5% {
      background-position: 0 100%, 100% -50px, 0 -50px, 100% -50px;
    }
    35% {
      background-position: 0 100%, 100% 100%, 0 -50px, 100% -50px;
    }
    52.5% {
      background-position: 0 100%, 100% 100%, 0 calc(100% - 16px), 100% -50px;
    }
    70%, 98% {
      background-position: 0 100%, 100% 100%, 0 calc(100% - 16px), 100% calc(100% - 16px);
    }
  }

  @keyframes move2 {
    0%, 70% {
      transform: translate(0);
    }
    100% {
      transform: translate(200%);
    }
  }
`;

export default Loaderstart;

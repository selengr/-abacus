import React, { FC } from "react";

import StyledBlankState from "./index.css";

interface BlankStateAction {
  style?: string;
  label?: string;
  onClick?: () => void;
}

interface BlankStateProps {
  dashed?: boolean;
  bordered?: boolean;
  transparent?: boolean;
  title: string;
  subtitle: string;
  action?: BlankStateAction | null;
}

const BlankState: FC<BlankStateProps> = ({
  dashed = false,
  bordered = false,
  transparent = false,
  title,
  subtitle,
  action = null,
}) => (
  <StyledBlankState
    className={`blank-state${dashed ? " dashed" : ""}${
      bordered ? " bordered" : ""
    }${transparent ? " transparent" : ""}`}
  >
    <h5>{title}</h5>
    <p>{subtitle}</p>
    {action && (
      <button
        type="button"
        className={`btn btn-${action.style || "primary"}`}
        onClick={action.onClick}
      >
        {action.label || ""}
      </button>
    )}
  </StyledBlankState>
);

export default BlankState;

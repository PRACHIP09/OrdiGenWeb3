import React, { useState } from "react";
import { showAddress } from "../../utils/helpers";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

const renderTooltip = (props) => {
  return (
    <Tooltip id='button-tooltip' {...props}>
      Press to Disconnect
    </Tooltip>
  );
};

export const WalletButton = ({
  children,
  address,
  icon,
  onConnect,
  onDisconnect,
  ...rest
}) => {
  const btn = (
    <Button {...rest} onClick={address ? onDisconnect : onConnect}>
      {address ? (
        <span className='d-flex gap-2 align-items-center'>
          {icon}
          {showAddress(address)}
        </span>
      ) : (
        children
      )}
    </Button>
  );

  if (address) {
    return (
      <OverlayTrigger placement='top' overlay={renderTooltip}>
        {btn}
      </OverlayTrigger>
    );
  }

  return btn;
};

import { Button, Modal } from "react-bootstrap";
import stakingbtn from "../svgs/stakingbtn.svg";
import { Link } from "react-router-dom";

export const StakeButton = () => {
    return (
        <Link to="/staking">
            <Button className="btnStyle-right">
                STAKING
                <img src={stakingbtn}
                    style={{ width: "1.25rem", height: "1.25rem", marginTop: "-0.25rem", marginLeft: "0.5rem" }} />
            </Button>
        </Link>
    )
}
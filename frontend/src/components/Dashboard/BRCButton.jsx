import { Button, Modal } from "react-bootstrap";
import brcbtn from "../svgs/brcbtn.svg";
import { Link } from "react-router-dom";

export const BRCButton = () => {
    return (
        <Link to="/dashboard">
            <Button className="btnStyle">
                <img src={brcbtn}
                    style={{ width: "1.25rem", height: "1.25rem", marginTop: "-0.25rem", marginRight: "0.5rem" }} />
                BRC-20
            </Button>
        </Link>
    )
}
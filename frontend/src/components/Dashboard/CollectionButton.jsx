import { Button, Modal } from "react-bootstrap";
import collectionbtn from "../svgs/collectionbtn.svg"
import { Link } from "react-router-dom";

export const CollectionButton = () => {
    return (
        <Link to="/collections">
            <Button className="btnStyle">
                <img src={collectionbtn}
                    style={{ width: "1.25rem", height: "1.25rem", marginTop: "-0.25rem", marginRight: "0.5rem" }} />
                Collections
            </Button>
        </Link>
    )
}
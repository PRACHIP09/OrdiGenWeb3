import { useContext } from "react";
import { GeneralDataContext } from "../contexts/GeneralDataProvider";

export const useGeneralDataContext = () => useContext(GeneralDataContext);

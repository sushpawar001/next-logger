import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faWeightScale,
    faSyringe,
    faHouse,
    faDroplet,
    faUser,
    faTape,
    faChartSimple,
    faArrowRightToBracket,
    faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

export function HouseIcon({ className = "" }) {
    return <FontAwesomeIcon icon={faHouse} className={className || ""} />;
}

export function SyringeIcon({ className = "" }) {
    return <FontAwesomeIcon icon={faSyringe} className={className || ""} />;
}
export function GlucoseIcon({ className = "" }) {
    return <FontAwesomeIcon icon={faDroplet} className={className || ""} />;
}
export function WeightScaleIcon({ className = "" }) {
    return <FontAwesomeIcon icon={faWeightScale} className={className || ""} />;
}

export function ProfileIcon({ className = "" }) {
    return <FontAwesomeIcon icon={faUser} className={className || ""} />;
}

export function TapeIcon({ className = "" }) {
    return <FontAwesomeIcon icon={faTape} className={className || ""} />;
}

export function ChartIcon({ className = "" }) {
    return <FontAwesomeIcon icon={faChartSimple} className={className || ""} />;
}

export function LoginIcon({ className = "" }) {
    return <FontAwesomeIcon icon={faArrowRightToBracket} className={className || ""} />;
}

export function SignUpIcon({ className = "" }) {
    return <FontAwesomeIcon icon={faUserPlus} className={className || ""} />;
}

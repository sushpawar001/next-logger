import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWeightScale, faSyringe, faHouse, faDroplet, faUser } from '@fortawesome/free-solid-svg-icons'

export function HouseIcon({className}) {
  return (
    <FontAwesomeIcon icon={faHouse} className={className||''} />
  )
}

export function SyringeIcon({className}) {
  return (
    <FontAwesomeIcon icon={faSyringe} className={className||''} />
  )
}
export function GlucoseIcon({className}) {
  return (
    <FontAwesomeIcon icon={faDroplet} className={className||''} />
  )
}
export function WeightScaleIcon({className}) {
  return (
    <FontAwesomeIcon icon={faWeightScale} className={className||''} />
  )
}

export function ProfileIcon({className}) {
  return (
    <FontAwesomeIcon icon={faUser} className={className||''} />
  )
}


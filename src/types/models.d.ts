export interface insulin {
    units: number;
    name: string;
    createdAt?: Date;
}

export interface insulinName {
    name: string;
}

export interface InsulinNameType {
    _id: string;
    name: string;
    createdAt: string;
}

export interface weight {
    value: number;
    createdAt?: Date;
}

export interface glucose {
    value: number;
    createdAt?: Date;
    _id?: string;
}

export interface measurement {
    _id?: string;
    arms: number;
    chest: number;
    abdomen: number;
    waist: number;
    hip: number;
    thighs: number;
    calves: number;
    user: string;
    createdAt?: Date;
}

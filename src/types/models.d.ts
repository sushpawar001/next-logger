export interface insulin {
    units: number;
    name: string;
    createdAt?: Date;
}

export interface insulinName {
    name: string;
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

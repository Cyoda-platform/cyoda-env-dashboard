export interface NodeConfig {
    [key: string]: any;
}

export interface Position {
    x: number;
    y: number;
}

export interface Transition {
    [key: string]: any;
    id: string;
    name: string;
    active: boolean;
    automated: boolean;
}

export interface Process {
    [key: string]: any;
    id: string;
    name: string;
}

export interface Criteria {
    [key: string]: any;
    id: string;
    name: string;
}

export interface PositionsMap {
    [key: string]: Position;
}

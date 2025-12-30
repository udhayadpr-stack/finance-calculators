export interface CellData {
    id: string;
    rawInput: string;
    output?: string;
    error?: string;
}

export interface Workspace {
    id: string;
    title: string;
    cells: CellData[];
    createdAt: number;
}

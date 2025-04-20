export type Med = {
    id: string;
    name: string;
    description: string;
    category: string;
    alternate_names: string[];
    created_at: string;
    updated_at: string;
};

export type Prescription = {
    id: string;
    medication_id: string;
    medication_name: string;
    name: string;
    dose: string;
    route: string;
    frequency: string;
    duration: string;
    instructions: string;
    renewals: number;
    created_at: string;
    updated_at: string;
};
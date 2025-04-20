import type { Protocol } from '~~/types/Protocol';

export type Caution = {
    id: string;    
    description: string;
    linked_protocols: Protocol[];
    created_at: string;
    updated_at: string;
};

export type Precaution = {
    id: string;
    title: string;
    description: string;
    linked_protocols: Protocol[];
    created_at: string;
    updated_at: string;
};

export type EligibilityCriteria = {
    id: string;
    type: string;
    description: string;
    linked_protocols: Protocol[];
    created_at: string;
    updated_at: string;
};
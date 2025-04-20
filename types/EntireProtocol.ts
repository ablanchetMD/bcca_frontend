
export type ProtocolPayload = {
    SummaryProtocol: SummaryProtocol;
    ProtocolEligibilityCriteria: ProtocolEligibilityCriterion[];
    ProtocolPrecautions: ProtocolPrecaution[];
    ProtocolCautions: ProtocolCaution[];
    Tests: Tests;
    ProtocolCycles: ProtocolCycle[];
    Toxicities: Toxicity[];
    Physicians: Physician[];
    ArticleReferences: ArticleReference[];
}

export type ArticleReference = {
    Id: string; // uuid
    Title: string;
    Authors: string;
    Journal: string;
    Year: string;
    Pmid: string;
    Joi: string;
}


export type Physician ={
    Id: string; // uuid
    FirstName: string;
    LastName: string;
}


export type SummaryProtocol = {
    Id: string; // uuid
    TumorGroup: string;
    Code: string;
    Name: string;
    Tags: string[];
    Notes: string;
    RevisedOn: string;
    ActivatedOn: string;
}


export type ProtocolEligibilityCriterion = {
    Id: string; // uuid
    Type: string;
    Description: string;
}


export type ProtocolPrecaution = {
    Id: string; // uuid
    Title: string;
    Description: string;
}


export type ProtocolCaution = {
    Id: string; // uuid
    Description: string;
}




export type Tests = {
    Baseline: BaselineTests;
    FollowUp: FollowUpTests;
}


export type BaselineTests ={
    RequiredBeforeTreatment: string[];
    RequiredButCanProceed: string[];
    IfClinicallyIndicated: string[];
}


export type FollowUpTests = {
    Required: string[];
    IfClinicallyIndicated: string[];
}

export type Toxicity = {
    Id: string; // uuid
    Title: string;
    Description: string;
    Category: string;
    Modifications: ToxicityModification[];
}


export type ToxicityModification = {
    Id: string; // uuid
    GradeId: string;
    Grade: string;
    GradeDescription: string;
    Adjustment: string;
}


export type ProtocolCycle = {
    Id: string; // uuid
    Cycle: string;
    CycleDuration: string;
    Treatments: Treatment[];
}

export type Treatment = {
    Id: string; // uuid
    MedicationName: string;
    MedicationId: string; // uuid
    Dose: string;
    Route: string;
    Frequency: string;
    Duration: string;
    AdministrationGuide: string;    
}

export type TreatmentModification = {
    Id: string; // uuid
    Category: string;
    Description: string;
    Adjustement: string;
}



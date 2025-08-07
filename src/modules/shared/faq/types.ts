export interface IFAQQuestion {
    question: string;
    answer: string;
    updatedOn?: string;
}

export interface IFAQRule {
    title: string;
    questions: IFAQQuestion[];
}

export interface IFAQSection {
    title: string;
    questions: IFAQQuestion[];
    rules: IFAQRule[];
}

export interface IFAQData {
    data: IFAQSection[];
}
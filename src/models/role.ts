export interface IRole extends Document {
    id?: string;
    name?: string;
    code: string;
    by_default?: boolean;
    created_at?: string;
    updated_at?: string;
};
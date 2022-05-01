
export interface ILambdas extends Document {
    id?: string;
    code: string;
    name: string;
    type: string;
    function: string;
    created_at?: string;
    updated_at?: string;
};
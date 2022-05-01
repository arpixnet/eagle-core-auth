import db from "../database/query";
import { ILambdas } from "../models/lambdas";

export class Lambda {
    static async findByCode(code: string): Promise<ILambdas | null> {
        const lambdaQuery = 'SELECT * FROM lambdas WHERE code = $1';
        try {
            const { rows } = await db.query(lambdaQuery, [code]);
            let lambda:ILambdas = (rows[0]) ? rows[0] : null;
            if (lambda) {
                return lambda;
            } else {
                return null
            }
        } catch (err) {
            console.error(err);
            return null
        }
    }
}
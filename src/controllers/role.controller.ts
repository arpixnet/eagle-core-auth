import db from "../database/query";
import { IRole } from "../models/role";

export class Role {
    constructor() { }

    // Get Roles
    static async getRoles(): Promise<IRole | null> { // ########## Falta paginación
        const rolesQuery = 'SELECT * FROM role';
        try {
            return await db.query(rolesQuery, []);
        } catch (err) {
            console.error(err);
            return null
        }
    }
}
import pool from './database';

export default {
    /**
     * DB Query
     * @param {object} req
     * @param {object} res
     * @returns {object} object
     */
    query(quertText: string, params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.query(quertText, params).then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err);
            });
        });
    },
};

// import { Injectable } from '@angular/core';
// import {SQLite,SQLiteObject} from '@ionic-native/sqlite/ngx'

// @Injectable({ providedIn: 'root' })
// export class db {
// //    dbObject:SQLiteObject;
// //    constructor(private sqllite:SQLite){
// //    }

   
//    async createDb(table)
//    {
//        await this.sqllite.create({
//            name:"db.storage",
//            location:"default"
//        }).then((db:SQLiteObject)  =>{
//        this.dbObject=db;
//        }).catch(err=>{
//        })
//        await this.createTable(table);
//    }
   

//    async createTable(table)
//    {
//        await this.dbObject.executeSql(
//            `CREATE TABLE IF NOT EXISTS ${table} (uid VARCHAR(50) PRIMARY KEY, name VARCHAR(255))`,
//            []
//        ).catch(err=>{
           
//     })
//    }
//    async dropTable(table)
//    {
//        await this.dbObject.executeSql(`DROP TABLE ${table}`)
//    }

//    async addContact(table,uid,name)
//    {
//        return this.dbObject.executeSql(`
//        INSERT INTO ${table} (uid,name) VALUES ('${uid}','${name}')`,
//        []
//        ).then(log=>{

//     }).catch(err=>{
//     })
//     }

//     async readContact(table)
//     {
//         return this.dbObject.executeSql(`
//         SELECT * FROM ${table}`,[]).then(data=>{

//             return data;
//         }).catch(err=>{
//         })
//     }

//     async deleteContact(table,uid)
//     {
//         return this.dbObject.executeSql(`
//         DELETE FROM ${table} WHERE uid = '${uid}'`, []).then(()=>{
//         }).catch(er=>{
//             alert(JSON.stringify(er))

//         })
//     }

//     async editContact(table,name,uid)
//     {
//         return this.dbObject.executeSql(`
//         UPDATE ${table} SET name='${name}' WHERE uid=${uid}`,  [])
//     }
// }
import { ActionTree, GetterTree, MutationTree } from 'vuex';
import { connect } from '@tableland/sdk';

export interface Person {
  name: string;
  deleted: boolean;
  id: number;
  walletAddress: string;
  facialHash: string;
}

export const state = function () {
  return {
    alertMessage: '',
    tableland: {} as any,
    listTable: [] as any,
    listTableName: '' as string,
    currentTableId: '' as string,
    currentTableName: '' as string,
    currentQueryableName: '' as string,
    persons: [] as Person[]
  };
};

  // store the tableland connection as a private plain Object
  const getConnection = function () {
    let connection: any;
    return async function () {
      if (connection) return connection;
  
      connection = await connect({
        chain: process.env.tablelandChain as string
      });
  
      return connection;
    };
  }();
  
  export type RootState = ReturnType<typeof state>
  
  interface KeyVal {
    key: string;
    value: any;
  };
  
  export const mutations: MutationTree<RootState> = {
    set: function (state: any, data: KeyVal) {
      state[data.key] = data.value;
    }
  };
  
  
  export const actions: ActionTree<RootState, RootState> = {
    alert: async function (context, params) {
      // There are potentially components watching alertMessage that will alter the view
      // e.g. a Toast message
      context.commit('set', {key: 'alertMessage', value: params.message});
      // because this "has side affects" we want it to be async so that callers of alert
      // can await then manipulate the view with the new state
      await wait(0);
    },
    connect: async function (context) {
      try {
        // connect to tableland
        console.log(`connecting to validator at: ${process.env.validatorHost}`);
        const tableland = await getConnection();
  
        const myAddress = await tableland.signer.getAddress();
        const allTables = await tableland.list();
  
        const listTable = allTables.find((list: any) => {
          return list.name.indexOf(`${listTablePrefix}_${myAddress.slice(2,8).toLowerCase()}`) === 0;
        });
  
        if (listTable && listTable.name) {
          context.commit('set', {key: 'listTableName', value: listTable.name as string});
          // get all of the user's existing tables
          return await context.dispatch('loadTables');
        }
  
        await context.dispatch('init');
      } catch (err) {
        throw err;
      }
    },
    // do one time create of table that holds all the list information
    init: async function (context) {
      try {
        const tableland = await getConnection();
  
        const listOwner = await tableland.signer.getAddress();
        const listTable = await tableland.create(sql.createListTable(), {
          prefix: `${listTablePrefix}_${listOwner.slice(2,10).toLowerCase()}`
        });
  
        // store queryable list table name for later use
        context.commit('set', {key: 'listTableName', value: listTable.name});
        return await context.dispatch('loadTables');
      } catch (err) {
        throw err;
      }
    },
    createList: async function (context, params) {
      try {
        const listName = params.name;
        const tableName = 'facelink_' + params.name.trim().replaceAll(' ', '_');
        const tableland = await getConnection();
  
        const table = await tableland.create(sql.createList(), { prefix: tableName });
        const queryableName = table.name as string;
  
        // stripping the id from queryable name
        const tableId = queryableName.split('_').pop() as string;
        const listOwner = await tableland.signer.getAddress();
        const listTable = await tableland.write(sql.insertList({
          listTableName: context.state.listTableName,
          listName: listName,
          tableName: queryableName,
          tableId: tableId
        })) as any;
  
        // refresh the list of all of the user's existing tables
        await context.dispatch('loadTables');
  
        // Load the new list for the user to interact with
        await context.dispatch('loadTable', {
          name: queryableName
        });
      } catch (err) {
        throw err;
      }
    },
    loadTables: async function (context) {
      try {
        const tableland = await getConnection();
        const listOwner = await tableland.signer.getAddress();
        const listTable = await tableland.read(sql.selectListTable(context.state.listTableName)) as any;
  
        if (!listTable.data) throw new Error('list table cannot be loaded');
  
        context.commit('set', {key: 'listTable', value: parseRpcResponse(listTable.data)});
      } catch (err) {
        throw err;
      }
    },
    loadTable: async function (context, params: {name: string}) {
      try {
        const tableland = await getConnection();
        const queryableName = `${params.name}`;
        const res = await tableland.read(sql.selectfacelinkTable(queryableName)) as any;
  
        const persons = parseRpcResponse(res.data);
  
        context.commit('set', {key: 'persons', value: persons || []});
  
        context.commit('set', {key: 'currentQueryableName', value: queryableName});
        const currentTable = context.state.listTable.find((list: any) => list.table_name === queryableName);
        if (currentTable && currentTable.list_name) {
          context.commit('set', {key: 'currentTableName', value: currentTable.list_name});
        }
      } catch (err) {
        throw err;
      }
    },
    createPerson: async function (context) {
      try {
        const person = {complete: false, name: '', id: getNextId(context.state.persons)};
        const tableland = await getConnection();
  
        // send off async request to Tableland
        const res = await tableland.write(sql.insertPerson(context.state.currentQueryableName, person)) as any;
  
        if (res.error) {
          console.log(res.error);
          await context.dispatch('loadTable', {name: context.state.currentQueryableName});
          return new Error(res.error.message);
        }
  
        await context.dispatch('loadTable', {name: context.state.currentQueryableName});
        return person;
      } catch (err) {
        throw err;
      }
    },
    updatePerson: async function (context, person: Person) {
      try {
        const tableland = await getConnection();
        const res = await tableland.write(sql.updatePerson(context.state.currentQueryableName, person)) as any;
  
        await context.dispatch('loadTable', {name: context.state.currentQueryableName});
      } catch (err) {
        throw err;
      }
    },
    deletePerson: async function (context, person: Person) {
      try {
        const tableland = await getConnection();
  
        const res = await tableland.write(sql.deletePerson(context.state.currentQueryableName, person.id)) as any;
  
        await context.dispatch('loadTable', {name: context.state.currentQueryableName});
      } catch (err) {
        throw err;
      }
    }
  };
  
  const getNextId = function (persons: Person[]) {
    const personIds = persons.map((person: Person) => person.id).sort((a: number, b: number) => a > b ? 1 : -1);
    const lastId = personIds[personIds.length - 1];
  
    return (lastId || 0) + 1;
  };
  
  // RPC responds with rows and columns in separate arrays, this will combine to an array of objects
  const parseRpcResponse = function (data: {rows: any[], columns: {name: string}[]}) {
    return data.rows.map((rowArr) => {
      const row = {} as {[key: string]: any};
      for (let i = 0; i < data.columns.length; i++) {
        const key = data.columns[i].name;
        row[key] = rowArr[i];
      }
  
      return row;
    });
  };
  
  const compareUuids = function (a: string, b: string) {
    return a.replaceAll(' ', '').replaceAll('-', '') === b.replaceAll(' ', '').replaceAll('-', '');
  };
  
  const formatUuid = function (val: string) {
    return [val.slice(0, 8), val.slice(8, 12), val.slice(12, 16), val.slice(16, 20), val.slice(20)].join('-');
  };
  
  // this is here for reference only. Creating the table that holds all lists only happens once ever when this app is built
  const listTablePrefix = 'facelink_';

// Modify the SQL queries to work with the 'Person' object
const sql = {
  createPersonTable: () => `
    name VARCHAR DEFAULT '',
    deleted BOOLEAN DEFAULT false,
    id INTEGER UNIQUE,
    walletAddress VARCHAR DEFAULT '',
    facialHash VARCHAR DEFAULT ''
  ;`,
  deletePerson: (name: string, personId: number) => `
    UPDATE ${name} SET deleted = true WHERE id = ${personId};
  `,
  insertPerson: (tableName: string, person: Person) => `
    INSERT INTO ${tableName} (name, deleted, id, walletAddress, facialHash)
    VALUES ('${person.name}', ${person.deleted}, ${person.id}, '${person.walletAddress}', '${person.facialHash}');
  `,
  selectPersonTable: (name: string) => `SELECT * FROM ${name} WHERE deleted = false;`,
  updatePerson: (name: string, person: Person) => `
    UPDATE ${name}
    SET name = '${person.name}', walletAddress = '${person.walletAddress}', facialHash = '${person.facialHash}'
    WHERE id = ${person.id};
  `,
};

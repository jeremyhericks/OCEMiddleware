const { ApolloServer, gql } = require('apollo-server');
const { find, filter } = require('lodash');
const redis = require('redis');

const client = redis.createClient();

const { promisify } = require("util");
const getAsync = promisify(client.get).bind(client);

client.on('connect', () => {
  console.log('Redis Connected')
  require('bluebird').promisifyAll(client)
})


const db = {
  documents : [{
    id: 1,
    title: "English Document",
    language: "en",
    translations: [2, 3],
    folder: 1
  },
  {
    id: 2,
    title: "French Document",
    language: "fr",
    translations: [1, 3],
    folder: 1
  },
  {
    id: 3,
    title: "German Document",
    language: "de",
    translations: [2, 1],
    folder: 1
  },
  {
    id: 4,
    title: "Image 1",
    language: "en",
    translations: [],
    folder: 2
  }
  ],
  folders : [{
    id: 1,
    title: "Home",
    parentFolder: 0,
    childFolders: [2, 3],
    documents: []
  },
  {
    id: 2,
    title: "Docs",
    parentFolder: 1,
    childFolders: [4],
    documents: [1, 2, 3]
  },
  {
    id: 3,
    title: "Images",
    parentFolder: 1,
    childFolders: [],
    documents: [4]
  },
  {
    id: 4,
    title: "Subdocs",
    parentFolder: 2,
    childFolders: [],
    documents: []
  }
  ]
};
//console.log(client.get("db", redis.print))
client.set("db", JSON.stringify(db), redis.print)
// client.get("folder_F7B4FCB8EB6ADBF88A39F85BCA52D37AD76A73D9EA5E", redis.print)
// client.get("file_D88244780E92BD80046F9086C2B77C61D044FF608593", redis.print)

const typeDefs = gql`
  type Query {
    documents: [Document]
    folders: [Folder]
  }

  type Document {
    id: ID
    title: String
    language: String
    translations: [Document]
    folder: Folder
  }

  type Folder {
    id: ID
    title: String
    parentFolder: Folder
    childFolders: [Folder]
    documents: [Document]
  }
`;

const resolvers = {
  Query: {
    documents: async () =>  {
      let redis_db = await getAsync("db");
      return JSON.parse(redis_db).documents
    },
    folders: async () =>  {
      let redis_db = await getAsync("db");
      return JSON.parse(redis_db).folders
    }
  },
  Document: {
    translations: async parent => {
      let redis_db = await getAsync("db");
      let docs = JSON.parse(redis_db).documents
      return filter(docs, function(doc) {
        if(parent.translations.indexOf(doc.id) > -1) {
          return true;
        } else {
          return false
        }
      });
    },
    folder: async parent => {
      let redis_db = await getAsync("db");
      let folders = JSON.parse(redis_db).folders
      return folders.find(({ id }) => {
        return parent.folder === id
      })
    }
  },
  Folder: {
    childFolders: async parent => {
      let redis_db = await getAsync("db");
      let folders = JSON.parse(redis_db).folders
      return filter(folders, function(folder) {
        if(parent.childFolders.indexOf(folder.id) > -1) {
          return true;
        } else {
          return false
        }
      });
    },
    documents: async parent => {
      let redis_db = await getAsync("db");
      let docs = JSON.parse(redis_db).documents
      return filter(docs, function(doc) {
        if(parent.documents.indexOf(doc.id) > -1) {
          return true;
        } else {
          return false
        }
      });
    },
    parentFolder: async parent => {
      let redis_db = await getAsync("db");
      let folders = JSON.parse(redis_db).folders
      return folders.find(({ id }) => {
        return parent.parentFolder === id
      })
    }
  }

};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);

});

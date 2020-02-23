const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');

const client = redis.createClient();

// Some fake data
const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

// The GraphQL schema in string form
// const typeDefs = `
//   type Query { books: [Book] }
//   type Book { title: String, author: String }
//   type Mutation {
//     set(key: String!, value:  String!): Boolean!
//   }
// `;

const typeDefs = `
  type Query {
    get(key: String!): String
    book(title: String!): String
  }

  type Mutation {
    set(key: String!, value:  String!): Boolean!
    addBook(title: String!, author: String!): Boolean!
  }
`;

// The resolvers
// const resolvers = {
//   Query: { books: () => books },
// };

const resolvers = {
  Query: {
    get: (parent, {key}, {client}) => {
      try {
        return client.get(key)
      } catch (error) {
        return null
      }
    },
    book: (parent, {title}, {client}) => {
      try {
        //console.log(client.get(title))
        return client.get(title, redis.print)
      } catch (error) {
        return null
      }
    }
  },

  // client.set("key", "value", redis.print);
  // client.get("key", redis.print);


  Mutation: {
    set: async (parent, {key, value}, {client}) => {
      try {
        await client.set(key, value)
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    },
    addBook: async (parent, {title, author}, {client}) => {
      let thisBook = {"title": title, "author": author}
      console.log(thisBook)
      try {
        await client.set(title, author, redis.print)
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    }
  }
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Initialize the app
const app = express();

// The GraphQL endpoint
//app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema, context: { client } }));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(3000, () => {
  console.log('Go to http://localhost:3000/graphiql to run queries!');
});

import express from 'express';
import bodyParser from 'body-parser';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import resolvers from './resolvers';
import { makeExecutableSchema } from "graphql-tools";

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: Author
  }
  type Author {
    name: String
    books: [Book]
    age: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    getBooks: [Book]
    getAuthors: [Author]
  }
`;

const resolvers = {
  Query: {
    getBooks: () => books,
    getAuthors: () => authors
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const PORT = 4000;

const app = express();

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))
app.listen(PORT);

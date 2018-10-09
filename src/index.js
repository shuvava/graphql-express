const express = require('express')
const cors = require('cors')
const graphqlHTTP = require('express-graphql')
const gql = require('graphql-tag')
const { buildASTSchema } = require('graphql')

const app = express()
app.use(cors())

const PEOPLE = new Map()
const POSTS = new Map()

class Post {
  constructor (data) { Object.assign(this, data) }
  get author () {
    return PEOPLE.get(this.authorId)
  }
}

class Person {
    constructor (data) { Object.assign(this, data) }
    get posts () {
      return [...POSTS.values()].filter(post => post.authorId === this.id)
    }
  }
const initializeData = () => {
const fakePeople = [
    { id: '1', firstName: 'John', lastName: 'Doe' },
    { id: '2', firstName: 'Jane', lastName: 'Doe' }
]

fakePeople.forEach(person => PEOPLE.set(person.id, new Person(person)))

const fakePosts = [
    { id: '1', authorId: '1', body: 'Hello world' },
    { id: '2', authorId: '2', body: 'Hi, planet!' }
]

fakePosts.forEach(post => POSTS.set(post.id, new Post(post)))
}

initializeData()

const schema = buildASTSchema(gql`
type Query {
    posts: [Post]
    post(id: ID): Post
    authors: [Person]
    author(id: ID): Person
    hello: String
  }

  type Post {
    id: ID
    author: Person
    body: String
  }

  type Person {
    id: ID
    posts: [Post]
    firstName: String
    lastName: String
  }
`)

const rootValue = {
  hello: () => 'Hello, world',
  posts: () => POSTS.values(),
  post: ({ id }) => POSTS.get(id),
  authors: () => PEOPLE.values(),
  author: ({ id }) => PEOPLE.get(id)
}

app.use('/graphql', graphqlHTTP({ schema, rootValue }))

const port = process.env.PORT || 4000
app.listen(port)
console.log(`Running a GraphQL API server at http://localhost:${port}/graphql`)
console.log(`test environment in https://www.graphqlbin.com/v2/new`)
/*
--1
query {
  hello
}
--2
query {
  posts {
    id
    author {
      id
      firstName
      lastName
    }
    body
  }
}
--3
query {
  post(id: 2) {
    author {
      firstName
      posts {
        id
        body
      }
    }
  }
}
*/
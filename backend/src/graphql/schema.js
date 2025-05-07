import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type User {
    id: ID!
    email: String!
    name: String
    createdAt: String!
    updatedAt: String!
  }

  type Project {
    id: ID!
    name: String!
    category: String!
    productDetails: ProductDetails
    researchScope: ResearchScope
    competitors: [String]
    userId: ID!
    createdAt: String!
    updatedAt: String!
  }

  type ProductDetails {
    name: String!
    description: String
    imageUrl: String
    category: String!
    subcategory: String
    attributes: [Attribute]
  }

  type Attribute {
    name: String!
    value: String!
  }

  type ResearchScope {
    platforms: [String]!
    sampleSize: String!
    geographicFocus: [String]!
    timeframe: String
  }

  type RedditData {
    id: ID!
    projectId: ID!
    subreddit: String!
    postId: String!
    title: String
    content: String
    upvotes: Int
    commentCount: Int
    createdAt: String!
    sentiment: Float
    keywords: [String]
  }

  type AmazonReview {
    id: ID!
    projectId: ID!
    productId: String!
    rating: Int!
    title: String
    content: String!
    helpfulVotes: Int
    verifiedPurchase: Boolean
    createdAt: String!
    sentiment: Float
    keywords: [String]
  }

  type MarketSize {
    id: ID!
    projectId: ID!
    category: String!
    subcategory: String
    size: Float!
    unit: String!
    year: Int!
    growthRate: Float
    source: String
  }

  type PainPoint {
    id: ID!
    projectId: ID!
    name: String!
    description: String!
    frequency: Float!
    sentiment: Float!
    sources: [String]!
  }

  type Desire {
    id: ID!
    projectId: ID!
    name: String!
    description: String!
    frequency: Float!
    sentiment: Float!
    sources: [String]!
  }

  type MarketingInsight {
    id: ID!
    projectId: ID!
    type: String!
    content: String!
    relevanceScore: Float!
    implementationDifficulty: String!
  }

  type AuthData {
    token: String!
    userId: ID!
    expiresIn: Int!
  }

  input UserInput {
    email: String!
    password: String!
    name: String
  }

  input ProjectInput {
    name: String!
    category: String!
    productDetails: ProductDetailsInput
    researchScope: ResearchScopeInput
    competitors: [String]
  }

  input ProductDetailsInput {
    name: String!
    description: String
    imageUrl: String
    category: String!
    subcategory: String
    attributes: [AttributeInput]
  }

  input AttributeInput {
    name: String!
    value: String!
  }

  input ResearchScopeInput {
    platforms: [String]!
    sampleSize: String!
    geographicFocus: [String]!
    timeframe: String
  }

  type Query {
    login(email: String!, password: String!): AuthData!
    user: User!
    projects: [Project!]!
    project(id: ID!): Project
    redditData(projectId: ID!): [RedditData!]!
    amazonReviews(projectId: ID!): [AmazonReview!]!
    marketSize(projectId: ID!): [MarketSize!]!
    painPoints(projectId: ID!): [PainPoint!]!
    desires(projectId: ID!): [Desire!]!
    marketingInsights(projectId: ID!): [MarketingInsight!]!
  }

  type Mutation {
    createUser(userInput: UserInput!): User!
    createProject(projectInput: ProjectInput!): Project!
    updateProject(id: ID!, projectInput: ProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
    startDataCollection(projectId: ID!): Boolean!
    generateInsights(projectId: ID!): Boolean!
  }

  schema {
    query: Query
    mutation: Mutation
  }
`);

export default schema;

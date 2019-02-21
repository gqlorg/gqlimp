const buildSchema = require('graphql').buildSchema;

module.exports = buildSchema(`

  scalar HashID
  
  input UserInput {
    name: String
    email: String,
    country: CountryInput    
  } 
  
  input CountryInput {
    code: String 
  }
  
  enum Gender {
    FEMALE
    MALE
  }
  
  enum UserKind {
    ADMIN
    GUEST  
  }
  
  type Country {
    code: String
    name: String
  }
    
  type User {
    id: Int
    name: String!
    email: String
    kind: UserKind
    mask: HashID
    phone: Phone,
    gender: Gender
    country(filter: CountryInput): [Country]
  }
  
  type Phone {
    gsm: String
    note: String
  }
  
  input PhoneInput {
    gsm: String
    note: String
  }       
  
  type Query {    
    user(id: Int!): User
    users(country: CountryInput, gender: [Gender]): [User]  
    timeoutServer(interval: Int!): String 
    serverName: String
  }
  
  type Mutation {
    createUser(user: UserInput): User
    createUserPhone(userId:Int, phone: PhoneInput): Boolean
    updateUser(id: Int!, user: UserInput): User    
  }  
  
  `);


# gqlimp

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![DevDependencies][devdependencies-image]][devdependencies-url]

[![NPM](https://nodei.co/npm/gqlimp.png?downloads=true&downloadRank=true)](https://nodei.co/npm/gqlimp/)

Gqlimp is an executable npm package created for client applications that communicate with the graphql server. 
The reasons to create this tool are to accelerate development of server applications coded with graphql in the client part and to increase client - server interaction.

It is intended that the query scheme created on the graphql server can be used easily and accurately in the client application via Gqlimp.Thanks to perform programmatic processing when creating a query, it can be developped code more flexible and faster in client side.

When there is a change in the query scheme created on the server, the client will be aware of this change and will have to make the necessary arrangements thanks to the import mechanism.

## Installation

```sh
$ npm install gqlimp
```

## Features

Feature Guide
```sh
$ gqlimp --help
```

```sh
Options

  --url required                           (-u) This parameter graphql server url                     
  --fileName default "schema-types"        (-f) This parameter output schema file name                
  --generate optional                      (-g) This parameter with generate output file              
  --output default "output"                (-o) This parameter output folder path                     
  --verbose optional                       (-v) This parameter print schema console                   
  --type options "ts", "js" default "ts"   (-t) This parameter to output "typescript" or "javascript" 
  --help                                   (-h) Print this usage guide.                               
```

#### Public root classes

* QueryObject & MutationObject
    * Properties
        * query
        * args         
        
        
## How to work "gqlimp" tool?

##### Example graphql server schema type (url -> http://example.com:5000/api)

```ts

  type Phone {
    gsm: String
    note: String
  }

  type User {
    id: Int
    name: String  
    phone: Phone       
  }
  
  type Query {    
    user(id: Int!): User     
  }
  
  input PhoneInput {
    gsm: String
    note: String
  }  
  
  input UserInput {
    name: String  
    phone: PhoneInput    
  } 
  
  type Mutation {
    createUser(user: UserInput): User
  }    
  
```

##### Execute command:

```sh
$ gqlimp --url http://example.com:5000/api -g
```

##### Generated file (schema-types.ts) view with "gqlimp" 

```ts

  export interface Phone_intf {
    gsm? : boolean | number;
    note? : boolean | number;
  }

  export interface User_intf {
    id? : boolean | number;
    name? : boolean | number;
    phone? : User_phone;	
  } 

  export interface Query_intf {
    user? : Query_user;
  }
  
  export interface Mutation_intf {
    createUser? : Mutation_createUser;
  }
  
  /*
  export class QueryObject ...
  
  export class MutationObject ...
  
  export class Query_user ...
  
  export class User_phone ...
  
  export class Mutation_createUser ...
  */

```

##### Usage client "schema-types.ts" file

Query Example:
```ts

  import { QueryObject } from './schema-types';
    
  const qo = new QueryObject({
    user: new Query_user({
      id: true,
      name: true,
      phone: new User_phone({
        gsm: true,
        note: true
      })  
    })
  });
  
  console.log(qo.query);
  /* Output
  query {
    user {
      id
      name
      phone {
        gsm
        note
      }
    }
  }
  */

```

Mutation Example:
```ts

  import { QueryObject } from './schema-types';
    
  const qo = new MutationObject({
    createUser: new Mutation_createUser({     
      name: 'User 1',
      phone: {
        gsm: 'User Gsm',
        note: 'Note'
      }  
    },
    {
      id: true,
      name: true      
    })
  });
  
  console.log(qo.query);
  /* Output
    mutation ($name: String, $phone: PhoneInput) {
      createUser(name: $name, phone: $phone ) {
        id
        name
      }
    }
  
  console.log(qo.args);
  /* Output
    {
      name: 'User 1',
      phone: {
        gsm: 'User Gsm',
        note: 'Note'
      }
    }
  */

```

---



## Node Compatibility

  - node `>= 6.x`;
  
### License
[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/gqlimp.svg
[npm-url]: https://npmjs.org/package/gqlimp
[travis-image]: https://img.shields.io/travis/gqlorg/gqlimp/master.svg
[travis-url]: https://travis-ci.org/gqlorg/gqlimp
[coveralls-image]: https://img.shields.io/coveralls/gqlorg/gqlimp/master.svg
[coveralls-url]: https://coveralls.io/r/gqlorg/gqlimp
[downloads-image]: https://img.shields.io/npm/dm/gqlimp.svg
[downloads-url]: https://npmjs.org/package/gqlimp
[gitter-image]: https://badges.gitter.im/gqlorg/gqlimp.svg
[gitter-url]: https://gitter.im/gqlorg/gqlimp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[dependencies-image]: https://david-dm.org/gqlorg/gqlimp/status.svg
[dependencies-url]:https://david-dm.org/gqlorg/gqlimp
[devdependencies-image]: https://david-dm.org/gqlorg/gqlimp/dev-status.svg
[devdependencies-url]:https://david-dm.org/gqlorg/gqlimp?type=dev
[quality-image]: http://npm.packagequality.com/shield/gqlimp.png
[quality-url]: http://packagequality.com/#?package=gqlimp

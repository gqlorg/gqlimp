module.exports = {
  schemaQuery: `query {
  __schema {
			types {
				kind
				name
				enumValues {
					name
					description
				}
				inputFields {
					name
					type {
						kind
						name
						ofType {
							kind
							name
							ofType {
								kind
								name
							}
						}
					}
				}
				fields {
					name
					type {
						kind
						name
						ofType {
							kind
							name
							ofType {
								kind
								name
							}
						}
					}
					args {
						name
						type {
							kind
							name
							ofType {
								kind
								name
								ofType {
									kind
									name
								}
							}
						}
					}
				}
			}
		}
}`,
  headerDeclaration: `/**
    Generated with GqlImporter
    All Graphql Types
    Created Time ${new Date()}
*/`,
  helperClassDeclaration: `export class GqlClass< T > {

  constructor(public fields: T) {
  }

}

export class GqlWithoutFieldsArgsClass< T > {

    public types: any = {};
    
    constructor(public args: T) {
    }

}

export class GqlArgsClass< T, Q> extends GqlClass< Q > {

  public types: any = {};

  constructor(public args: T, public fields: Q) {
    super(fields);
  }

}`,
  queryObject: `export class GqlBaseObject< T > extends GqlClass< T > {

  private readonly _query: string;
  private _args: object;
  private _argTypes: any;

  constructor(fields: T) {
    super(fields);
    this._query = this.prepareQuery(fields);
  }
  
  get queryType(): string {
    return '';
  }

  private getArgTypes(): string {
    let str = '';
    for (const key in this._argTypes) {
      if (this._argTypes.hasOwnProperty(key)) {
        str += (str !== '' ? ',' : '') + '$' + key + ' : ' + this._argTypes[key];
      }
    }
    return str;
  }

  private prepareQuery(obj?: any, tab?: number): string {
    tab = tab || 1;
    const getTab = (t: number) => {
      let s = '';
      while (t > 0) {
        s += '\\t';
        t--;
      }
      return s;
    };
    let str = '';
    let fc = 0;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] instanceof GqlArgsClass || obj[key] instanceof GqlWithoutFieldsArgsClass) {
          tab++;
          str += ' ' + key;
          if (obj[key].args && obj[key].types) {
            const args = obj[key].args;
            const types = obj[key].types;
            this._argTypes = this._argTypes || {};
            this._args = { ...this._args, ...args };
            let sa = '';
            for (const k in args) {
              if (args.hasOwnProperty(k)) {
                this._argTypes[k] = types[k];
                sa += (sa !== '' ? ',' : '') + k + ' : $' + k;
              }
            }
            str += ' (' + sa + ') ';
          }
          if (obj[key] instanceof GqlArgsClass) {
            str += ' {\\n';
            str += getTab(tab) + this.prepareQuery(obj[key].fields, tab);
            str += '\\n' + getTab(tab - 1) + '}';
          }
        } else if (obj[key] instanceof GqlClass) {
          tab++;
          str += getTab(tab - 1) + key + ' {\\n';
          str += getTab(tab) + this.prepareQuery(obj[key].fields, tab);
          str += '\\n' + getTab(tab - 1) + '}';
        } else {
          str += (fc ? getTab(tab) : '') + key + '\\n';
        }
        fc++;
      }
    }
    return str;
  }

  get query(): string {
    let str = '';
    if (this._args) {
      str += this.queryType + ' (' + this.getArgTypes() + ') {\\n';
      str += this._query;
      str += '}';
    } else {
      str += '{\\n' + this._query + '\\n}';
    }
    return str;
  }

  get args(): object {
    return this._args;
  }


}

export class QueryObject extends GqlBaseObject<Query_intf> {
  get queryType(): string {
        return 'query';
  }
}

export class MutationObject extends GqlBaseObject<Mutation_intf> {
  get queryType(): string {
        return 'mutation';
  }
}

`,
  optionDefinitions: [
    {name: 'verbose', alias: 'v', type: Boolean},
    //   {name: 'lib', type: String, multiple: true, defaultOption: true},
    {name: 'url', alias: 'u', type: String},
    {name: 'generate', alias: 'g', type: Boolean},
    {name: 'fileName', alias: 'f', type: String},
    {name: 'output', alias: 'o', type: String},
    {name: 'help', alias: 'h', type: Boolean},
    {name: 'type', alias: 't', type: String, defaultOption: 'ts'}
  ],
  helpSections: [
    {
      header: 'GQL Importer',
      content: 'Import graphql schema to typescript or javascript'
    },
    {
      header: 'Options',
      optionList: [
        {
          name: 'url',
          typeLabel: '{underline required}',
          description: '(-u) This parameter graphql server url'
        },
        {
          name: 'fileName',
          typeLabel: '{italic optional}',
          description: '(-f) This parameter output schema file name.(default schema-types.ts)'
        },
        {
          name: 'generate',
          typeLabel: '{italic optional}',
          description: '(-g) This parameter with generate typescript file'
        },
        {
          name: 'output',
          typeLabel: '{italic optional}',
          description: '(-o) This parameter output folder path'
        },
        {
          name: 'verbose',
          typeLabel: '{italic optional}',
          description: '(-v) This parameter show types console log'
        },
        {
          name: 'type',
          typeLabel: '{italic options "ts", "js" default "ts"}',
          description: '(-t) This parameter to output "typescript" or "javascript"'
        },
        {
          name: 'help',
          description: '(-h) Print this usage guide.'
        }
      ]
    }
  ]
};


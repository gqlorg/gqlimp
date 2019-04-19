export class GQLClass<T> {

    constructor(public fields: T) {
    }

}

export class GQLWithoutFieldsArgsClass<T> {

    public argsMap: any = {};

    constructor(public args: T) {
    }

}

export class GQLArgsClass<T, Q> extends GQLClass<Q> {

    public argsMap: any = {};

    constructor(public args: T, public fields: Q) {
        super(fields);
    }

}

export class GQLBaseObject<T> extends GQLClass<T> {

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
                let aType = this._argTypes[key];
                if (aType.indexOf('[]') > -1) {
                    aType = '[' + aType.replace('[]', '') + ']';
                }
                str += (str !== '' ? ',' : '') + '$' + key + ' : ' + aType;
            }
        }
        return str;
    }

    private prepareQuery(obj?: any, tab?: number): string {
        tab = tab || 1;
        const getTab = (t: number) => {
            let s = '';
            while (t > 0) {
                s += '\t';
                t--;
            }
            return s;
        };
        let str = '';
        let fc = 0;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key] instanceof GQLArgsClass || obj[key] instanceof GQLWithoutFieldsArgsClass) {
                    tab++;
                    str += ' ' + key;
                    if (obj[key].args && obj[key].argsMap) {
                        const args = obj[key].args;
                        const types = obj[key].argsMap;
                        this._argTypes = this._argTypes || {};
                        this._args = {...this._args, ...args};
                        let sa = '';
                        for (const k in args) {
                            if (args.hasOwnProperty(k)) {
                                this._argTypes[k] = types[k];
                                sa += (sa !== '' ? ',' : '') + k + ' : $' + k;
                            }
                        }
                        str += ' (' + sa + ') ';
                    }
                    if (obj[key] instanceof GQLArgsClass) {
                        str += ' {\n';
                        str += getTab(tab) + this.prepareQuery(obj[key].fields, tab);
                        str += '\n' + getTab(tab - 1) + '}';
                    }
                } else if (obj[key] instanceof GQLClass) {
                    tab++;
                    str += getTab(tab - 1) + key + ' {\n';
                    str += getTab(tab) + this.prepareQuery(obj[key].fields, tab);
                    str += '\n' + getTab(tab - 1) + '}';
                } else {
                    str += (fc ? getTab(tab) : '') + key + '\n';
                }
                fc++;
            }
        }
        return str;
    }

    get query(): string {
        let str = '';
        if (this._args) {
            str += this.queryType + ' (' + this.getArgTypes() + ') {\n';
            str += this._query;
            str += '}';
        } else {
            str += this.queryType + ' {\n' + this._query + '\n}';
        }
        return str;
    }

    get args(): object {
        return this._args;
    }


}


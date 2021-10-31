export class PackageItem {
    private _index: number;
    private _weight: number;
    private _cost: number;

    constructor(index: number, weight: number, cost: number) {
        this._index = index;
        this._weight = weight;
        this._cost = cost;
    }

    get index(): number {
        return this._index;
    }

    get weight(): number {
        return this._weight;
    }

    get cost(): number {
        return this._cost;
    }

    set index(value: number) {
        this._index = value;
    }

    set weight(value: number) {
        this._weight = value;
    }

    set cost(value: number) {
        this._cost = value;
    }
}
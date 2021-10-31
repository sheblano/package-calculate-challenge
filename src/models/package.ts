import { PackageItem } from "./package-item";

export class Package {
    private _weightLimit: number;
    private _packageItems: PackageItem[];

    constructor(weightLimit: number = 0, packageItems: PackageItem[] = []) {
        this._weightLimit = weightLimit;
        this._packageItems = packageItems;
    }

    addPackageItem(item: PackageItem) {
        this._packageItems.push(item);
    }

    get weightLimit(): number {
        return this._weightLimit;
    }

    set weightLimit(limit) {
        this._weightLimit = limit;
    }

    get packageItems(): PackageItem[] {
        return this._packageItems;
    }

    set packageItems(items) {
        this._packageItems = items;
    }
}
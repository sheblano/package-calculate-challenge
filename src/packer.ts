import { ApiError } from './error';
import { Package } from './models/package';
import { PackageItem } from './models/package-item';
import * as fs from "fs";
import * as readline from "readline";
import { CONSTANTS } from './constants';

export class Packer {
    public async pack(inputFile: string): Promise<string | undefined> {
        const packages: Package[] = await this.processLineByLine(inputFile);
        let result = '';
        if (packages.length > 0) {
            // console.log('*** from package *** ');
            // console.log(JSON.stringify(packages));
            for (let i = 0; i < packages.length; i++) {
                console.log('*** test case *** ' + i);
                const currentPackage = packages[i];
                result += this.calculatePackage(currentPackage.weightLimit, currentPackage.packageItems);
                // for new line in all cases except last one
                if (i < packages.length - 1) {
                    result += '\n';
                };
            }
        } else {
            throw new ApiError('invalid inputFile to parse');
        }
        return result;
    }

    private async processLineByLine(filePath: string) {
        const packages: Package[] = [];
        const fileStream = fs.createReadStream(filePath);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            // Each line in input.txt will be successively available here as `line`.
            const pkg = this.convertInputLineToPackage(line);
            packages.push(pkg);
        }

        return packages;
    }

    private convertInputLineToPackage(line: string) {
        // line = '81 : (1,53.38,€45) (2,88.62,€98) (3,78.48,€3) (4,72.30,€76) (5,30.18,€9) (6,46.34,€48)';
        // let currentPackage: Package;
        const dividedLine = line.split(' : ');
        const packageWeigthLimit = +dividedLine[0].trim();
        const packageItems: PackageItem[] = [];

        let packageItemsData = dividedLine[1].split(' ');


        // check total package weight constraint
        if (packageWeigthLimit && packageWeigthLimit > CONSTANTS.MAX_WEIGHT_FOR_PACKAGE) {
            throw new ApiError(`total package weight limit should be less than or equal ${CONSTANTS.MAX_WEIGHT_FOR_PACKAGE}`);
        }

        for (let i = 0; i < packageItemsData.length; i++) {
            const itemValues = packageItemsData[i].trim().replace(/[{(€)}]/g, '').split(',');
            const index = +itemValues[0];
            const weight = +itemValues[1];
            const cost = +itemValues[2];
            // console.log('item ', index, weight, cost);
            this.checkItemConstraints(index, weight, cost);

            const packageItem = new PackageItem(index, weight, cost);
            packageItems.push(packageItem);
        }

        return new Package(packageWeigthLimit, packageItems);
    }

    private checkItemConstraints(index: number, weight: number, cost: number) {
        if (index && index > CONSTANTS.MAX_PACKAGE_ITEMS_LENGTH) {
            throw new ApiError(`item index should be less than or equal ${CONSTANTS.MAX_PACKAGE_ITEMS_LENGTH}`);
        }

        if (weight && weight > CONSTANTS.MAX_PACKAGE_ITEM_WEIGHT) {
            throw new ApiError(`item weight should be less than or equal ${CONSTANTS.MAX_PACKAGE_ITEM_WEIGHT}`);
        }

        if (cost && cost > CONSTANTS.MAX_PACKAGE_ITEM_COST) {
            throw new ApiError(`item cost should be less than or equal ${CONSTANTS.MAX_PACKAGE_ITEM_COST}`);
        }
    }

    private calculatePackage(maxWeight: number, packageItems: PackageItem[]): string {
        const combinations = this.getAllCombinationsForItemsIndexes(maxWeight, packageItems);
        const inRangeItems = this.checkItemsInWeightRange(combinations, packageItems, maxWeight);
        const itemsWithHeightestCost = this.selectHeightestCostCombination(inRangeItems, packageItems);
        return this.convertPackageSelectedItemsToString(itemsWithHeightestCost);
    }

    private selectHeightestCostCombination(combinations: string[], packageItems: PackageItem[]) {
        const heightestCostGroup = {
            cost: 0,
            combinations: '-'
        };

        combinations.forEach(combCase => {
            let totalCostForCase = 0;
            for (let i = 0; i < combCase.length; i++) {
                const packageItemIndex = +combCase[i];
                const itemInThePachage = packageItems.find(obj => {
                    return obj.index === packageItemIndex
                });
                totalCostForCase += itemInThePachage?.cost || 0;
            }

            if (totalCostForCase >= heightestCostGroup.cost) {
                heightestCostGroup.cost = totalCostForCase;
                heightestCostGroup.combinations = combCase;
            }
        });
        return heightestCostGroup.combinations;
    }

    private checkItemsInWeightRange(combinations: string[], packageItems: PackageItem[], maxWeight: number) {
        const filteredCombinations: string[] = [];
        combinations.forEach(combCase => {
            let totalWeightForCase = 0;
            for (let i = 0; i < combCase.length; i++) {
                const packageItemIndex = +combCase[i];
                const itemInThePachage = packageItems.find(obj => {
                    return obj.index === packageItemIndex
                });

                totalWeightForCase += itemInThePachage?.weight || 0;
            }
            if (totalWeightForCase <= maxWeight) {
                filteredCombinations.push(combCase);
            }
        });
        return filteredCombinations;
    }

    private getAllCombinationsForItemsIndexes(maxWeight: number, packageItems: any[]) {
        let buffer: string[] = [];
        let result: string[] = [];
        for (let i = 0; i < packageItems.length; i++) {
            if (packageItems[i].weight <= maxWeight) {
                buffer = ['' + packageItems[i].index];
                let index = 0;
                while (result[index]) {
                    buffer.push('' + result[index] + packageItems[i].index);
                    index++;
                }
                result = result.concat(buffer);
            }
        }
        return result;
    }

    private convertPackageSelectedItemsToString(itemsWithHeightestCost: string): string {
        return itemsWithHeightestCost.split('',).join();
    }
}
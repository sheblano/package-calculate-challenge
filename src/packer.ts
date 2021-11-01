import { ApiError } from './exceptions/error';
import { Package } from './models/package';
import { PackageItem } from './models/package-item';
import * as fs from "fs";
import * as readline from "readline";
import { CONSTANTS } from './constants';

export class Packer {
    public static async pack(inputFile: string): Promise<string | undefined> {
        const packerInstance = new Packer();
        const packages: Package[] = await packerInstance.processLineByLine(inputFile);

        let result = '';
        if (packages.length > 0) {
            // console.log('*** from package *** ');
            // console.log(JSON.stringify(packages));
            for (let i = 0; i < packages.length; i++) {
                // console.log('*** test case *** ' + i);
                const currentPackage = packages[i];
                result += packerInstance.calculatePackage(currentPackage.weightLimit, currentPackage.packageItems);
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

    /**
     * this method for reading the test input file line by line and build model
     * @param filePath 
     * @returns void
     */
    private async processLineByLine(filePath: string): Promise<Package[]> {
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

    /**
     * convert line input to a package model
     * @param line 
     * @returns void
     * @throws ApiError if package weight exceeds
     */
    private convertInputLineToPackage(line: string): Package {
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

    /**
     * check the package item constraints index, weight and cost
     * @param index 
     * @param weight 
     * @param cost 
     * @throws ApiError if any constraint break
     */
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

    /**
     * calculating the items which should fulfil total weight is less than or equal to the package limit and the total cost is as large as possible
     * @param maxWeight 
     * @param packageItems 
     * @returns string of desired format for the output
     */
    private calculatePackage(maxWeight: number, packageItems: PackageItem[]): string {
        const combinations = this.getAllCombinationsForItemsIndexes(maxWeight, packageItems);
        const inRangeItems = this.checkItemsInWeightRange(combinations, packageItems, maxWeight);
        const itemsWithHeightestCost = this.selectHeightestCostCombination(inRangeItems, packageItems);
        return this.convertPackageSelectedItemsToString(itemsWithHeightestCost);
    }

    /**
     * choose best package items to fulfil the highest cost with best weight
     * @param combinations 
     * @param packageItems 
     * @returns string
     */
    private selectHeightestCostCombination(combinations: string[], packageItems: PackageItem[]): string {
        const selectedGroup = {
            cost: 0,
            weight: 0,
            combinations: '-'
        };

        combinations.forEach(combCase => {
            let totalCostForCase = 0;
            let totalWeightForCase = 0;
            for (let i = 0; i < combCase.length; i++) {
                const packageItemIndex = +combCase[i];
                const itemInThePachage = packageItems.find(obj => {
                    return obj.index === packageItemIndex
                });
                totalCostForCase += itemInThePachage?.cost || 0;
                totalWeightForCase += itemInThePachage?.weight || 0;
            }

            if (totalCostForCase >= selectedGroup.cost) {
                selectedGroup.cost = totalCostForCase;
                selectedGroup.weight = totalWeightForCase;
                selectedGroup.combinations = combCase;
            } else if (totalCostForCase === selectedGroup.cost && totalWeightForCase < selectedGroup.weight) {
                selectedGroup.cost = totalCostForCase;
                selectedGroup.weight = totalWeightForCase;
                selectedGroup.combinations = combCase;
            }
        });
        return selectedGroup.combinations;
    }

    /**
     * check package items in weight range
     * @param combinations 
     * @param packageItems 
     * @param maxWeight 
     * @returns string[] with item indexes for each combination 
     */
    private checkItemsInWeightRange(combinations: string[], packageItems: PackageItem[], maxWeight: number): string[] {
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

    /**
     * get All Combinations For package Items Indexes excluding the one with weight > max weight
     * @param maxWeight 
     * @param packageItems 
     * @returns 
     */
    private getAllCombinationsForItemsIndexes(maxWeight: number, packageItems: any[]): string[] {
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
    /**
     * format the selected case to the desired output
     * @param itemsWithHeightestCost 
     * @returns string 
     */
    private convertPackageSelectedItemsToString(itemsWithHeightestCost: string): string {
        return itemsWithHeightestCost.split('',).join();
    }
}
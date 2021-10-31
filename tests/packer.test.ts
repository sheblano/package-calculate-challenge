import { Packer } from './../src/packer';
import { expect } from 'chai';
import * as path from 'path';
import { ApiError } from '../src/error';
import { CONSTANTS } from '../src/constants';

const basedir = path.resolve('./')

describe('packer package', function () {
  
  it('pack single input - with only one valid item', async function () {
    const result = await Packer.pack(path.resolve(basedir, 'resources/package_with_only_one_valid_item'));

    expect(result).equal("4");
  });

  it('pack single input - with no valid item', async function () {
    const result = await Packer.pack(path.resolve(basedir, 'resources/package_with_no_valid_item'));

    expect(result).equal("-");
  });

  it('pack single input - with multiple valid items - case 1', async function () {
    const result = await Packer.pack(path.resolve(basedir, 'resources/package_with_multiple_valid_items'));

    expect(result).equal("2,7");
  });

  it('pack single input - with multiple valid items - case 2', async function () {
    const result = await Packer.pack(path.resolve(basedir, 'resources/package_with_multiple_valid_items-2'));

    expect(result).equal("8,9");
  });

  it('pack multiple inputs at once', async function () {
    const result = await Packer.pack(path.resolve(basedir, 'resources/example_input'));

    expect(result).equal(`4\n-\n2,7\n8,9`);
  });

  it('package weight limit should be less than or equal to max weight', async function () {
    let error: ApiError;
    try {
      await Packer.pack(path.resolve(basedir, 'resources/package_with_above_weight_limit'));
    } catch (err) {
      error = err
      expect(error.message).equal(new ApiError(`total package weight limit should be less than or equal ${CONSTANTS.MAX_WEIGHT_FOR_PACKAGE}`).message);
    }
  });

  it('pack with item cost > the max cost', async function () {
    let error: ApiError;
    try {
      await Packer.pack(path.resolve(basedir, 'resources/package_item_with_greater_than_max_cost'));
    } catch (err) {
      error = err
      expect(error.message).equal(new ApiError(`item cost should be less than or equal ${CONSTANTS.MAX_PACKAGE_ITEM_COST}`).message);
    }
  });

  it('pack with item weight > the max weight', async function () {
    let error: ApiError;
    try {
      await Packer.pack(path.resolve(basedir, 'resources/package_item_with_greater_than_max_weight'));
    } catch (err) {
      error = err
      expect(error.message).equal(new ApiError(`item weight should be less than or equal ${CONSTANTS.MAX_PACKAGE_ITEM_WEIGHT}`).message);
    }
  });

  it('pack with item index > the max allowed index', async function () {
    let error: ApiError;
    try {
      await Packer.pack(path.resolve(basedir, 'resources/package_item_with_greater_than_max_index'));
    } catch (err) {
      error = err
      expect(error.message).equal(new ApiError(`item index should be less than or equal ${CONSTANTS.MAX_PACKAGE_ITEMS_LENGTH}`).message);
    }
  });

});
/*--------------------------------------------------------------
 *  Copyright (c) Nickbing Lao<giscafer@outlook.com>. All rights reserved.
 *  Licensed under the MIT License.
 *  Github: https://github.com/giscafer
 *-------------------------------------------------------------*/

import { window, workspace } from 'vscode';
import globalState from '../globalState';
import { clean, uniq, events } from './utils';

export class BaseConfig {
  static getConfig(key: string, defaultValue?: any): any {
    const config = workspace.getConfiguration();
    const value = config.get(key);
    return value === undefined ? defaultValue : value;
  }

  static setConfig(cfgKey: string, cfgValue: Array<any> | string | number | Object) {
    events.emit('updateConfig:' + cfgKey, cfgValue);
    const config = workspace.getConfiguration();
    return config.update(cfgKey, cfgValue, true);
  }

  static updateConfig(cfgKey: string, codes: Array<any>) {
    const config = workspace.getConfiguration();
    const updatedCfg = [...config.get(cfgKey, []), ...codes];
    let newCodes = clean(updatedCfg);
    newCodes = uniq(newCodes);
    return config.update(cfgKey, newCodes, true);
  }

  static removeConfig(cfgKey: string, code: string) {
    const config = workspace.getConfiguration();
    const sourceCfg = config.get(cfgKey, []);
    const newCfg = sourceCfg.filter((item) => item !== code);
    if(sourceCfg.length === newCfg.length){
      window.showInformationMessage(`删除期货不成功。请 [点击此处](https://github.com/LeekHub/leek-fund/issues/281) 查看期货相关问题`);
    }
    return config.update(cfgKey, newCfg, true);
  }
}

export class LeekFundConfig extends BaseConfig {
  constructor() {
    super();
  }
  // Fund Begin
  static addFundGroupCfg(name: string, cb?: Function) {
    globalState.fundGroups.push(name);
    globalState.fundLists.push([]);
    this.setConfig('leek-fund.fundGroups', globalState.fundGroups);
    this.setConfig('leek-fund.funds', globalState.fundLists);
    window.showInformationMessage(`Fund Group Successfully add.`);
    if (cb && typeof cb === 'function') {
      cb(name);
    }
  }

  static renameFundGroupCfg(groupId: string, name: string, cb?: Function) {
    const index: number = parseInt(groupId.replace('fundGroup_', ''));
    globalState.fundGroups[index] = name;
    this.setConfig('leek-fund.fundGroups', globalState.fundGroups);
    window.showInformationMessage(`Fund Group Successfully rename.`);
    if (cb && typeof cb === 'function') {
      cb(groupId);
    }
  }

  static removeFundGroupCfg(groupId: string, cb?: Function) {
    const index: number = parseInt(groupId.replace('fundGroup_', ''));
    const removedFundList: Array<string> = globalState.fundLists[index];
    const removeFundGroup = () => {
      globalState.fundGroups.splice(index, 1);
      globalState.fundLists.splice(index, 1);
      this.setConfig('leek-fund.fundGroups', globalState.fundGroups);
      this.setConfig('leek-fund.funds', globalState.fundLists);
      window.showInformationMessage(`Fund Group Successfully delete.`);
      if (cb && typeof cb === 'function') {
        cb(groupId);
      }
    };

    if (removedFundList.length) {
      window.showInformationMessage('删除分组会清空基金数据无法恢复，请确认！！', '好的', '取消').then((res) => {
        if (res === '好的') {
          removeFundGroup();
        }
      });
    } else {
      removeFundGroup();
    }
  }

  static addFundCfg(groupId: string, code: string, cb?: Function) {
    const index: number = parseInt(groupId.replace('fundGroup_', ''));
    const funds = globalState.fundLists[index] as Array<string | number>;
    let updatedFunds = [...funds, code];
    updatedFunds = clean(updatedFunds);
    updatedFunds = uniq(updatedFunds);
    globalState.fundLists[index] = updatedFunds as never;
    this.setConfig('leek-fund.funds', globalState.fundLists);
    window.showInformationMessage(`Fund Successfully add.`);
    if (cb && typeof cb === 'function') {
      cb(code);
    }
  }

  static removeFundCfg(code: string, cb?: Function) {
    const codeComponents = code.split('_');
    if (codeComponents.length < 3) {
      window.showInformationMessage(`Fund Id error.`);
      return;
    }
    const index: number = parseInt(codeComponents[1]);
    const fundCode: string = codeComponents[2];
    const funds = globalState.fundLists[index] as Array<string | number>;
    let updatedFunds = funds;
    updatedFunds.splice(updatedFunds.indexOf(fundCode), 1);
    updatedFunds = clean(updatedFunds);
    updatedFunds = uniq(updatedFunds);
    globalState.fundLists[index] = updatedFunds as never;
    this.setConfig('leek-fund.funds', globalState.fundLists);
    window.showInformationMessage(`Fund Successfully delete.`);
    if (cb && typeof cb === 'function') {
      cb(code);
    }
  }

  static setFundTopCfg(code: string, cb?: Function) {
    const codeComponents = code.split('_');
    if (codeComponents.length < 3) {
      window.showInformationMessage(`Fund Id error.`);
      return;
    }
    const index: number = parseInt(codeComponents[1]);
    const fundCode: string = codeComponents[2];
    const funds = globalState.fundLists[index] as Array<string>;
    const updatedFunds = [fundCode, ...funds.filter((item) => item !== fundCode)];
    globalState.fundLists[index] = updatedFunds as never;
    this.setConfig('leek-fund.funds', globalState.fundLists);
    window.showInformationMessage(`Fund Successfully set to top.`);
    if (cb && typeof cb === 'function') {
      cb(code);
    }
  }
  // Fund End

  // Stock Begin
  static addStockGroupCfg(name: string, cb?: Function) {
    globalState.stockGroups.push(name);
    globalState.stockLists.push([]);
    this.setConfig('leek-fund.stockGroups', globalState.stockGroups);
    this.setConfig('leek-fund.stocks', globalState.stockLists);
    window.showInformationMessage(`Stock Group Successfully add.`);
    if (cb && typeof cb === 'function') {
      cb(name);
    }
  }

  static renameStockGroupCfg(groupId: string, name: string, cb?: Function) {
    const index: number = parseInt(groupId.replace('stockGroup_', ''));
    globalState.stockGroups[index] = name;
    this.setConfig('leek-fund.stockGroups', globalState.stockGroups);
    window.showInformationMessage(`Stock Group Successfully rename.`);
    if (cb && typeof cb === 'function') {
      cb(groupId);
    }
  }

  static removeStockGroupCfg(groupId: string, cb?: Function) {
    const index: number = parseInt(groupId.replace('stockGroup_', ''));
    const removedStockList: Array<string> = globalState.stockLists[index];
    const removeStockGroup = () => {
      globalState.stockGroups.splice(index, 1);
      globalState.stockLists.splice(index, 1);
      this.setConfig('leek-fund.stockGroups', globalState.stockGroups);
      this.setConfig('leek-fund.stocks', globalState.stockLists);
      window.showInformationMessage(`Stock Group Successfully delete.`);
      if (cb && typeof cb === 'function') {
        cb(groupId);
      }
    };

    if (removedStockList.length) {
      window.showInformationMessage('删除分组会清空股票数据无法恢复，请确认！！', '好的', '取消').then((res) => {
        if (res === '好的') {
          removeStockGroup();
        }
      });
    } else {
      removeStockGroup();
    }
  }

  static addStockCfg(groupId: string, codes: string, cb?: Function) {
    const index: number = parseInt(groupId.replace('stockGroup_', ''));
    const stocks = globalState.stockLists[index] as Array<string | number>;
    let updatedStocks = [...stocks, ...codes.split(',')];
    updatedStocks = clean(updatedStocks);
    updatedStocks = uniq(updatedStocks);
    globalState.stockLists[index] = updatedStocks as never;
    this.setConfig('leek-fund.stocks', globalState.stockLists);
    window.showInformationMessage(`Fund Successfully add.`);
    if (cb && typeof cb === 'function') {
      cb(codes);
    }
  }

  static removeStockCfg(code: string, cb?: Function) {
    const codeComponents = code.split('_');
    if (codeComponents.length < 3) {
      window.showInformationMessage(`Stock Id error.`);
      return;
    }
    const index: number = parseInt(codeComponents[1]);
    const stockCode: string = codeComponents[2];
    const stocks = globalState.stockLists[index] as Array<string | number>;
    let updatedStocks = stocks;
    updatedStocks.splice(updatedStocks.indexOf(stockCode), 1);
    updatedStocks = clean(updatedStocks);
    updatedStocks = uniq(updatedStocks);
    globalState.stockLists[index] = updatedStocks as never;
    this.setConfig('leek-fund.stocks', globalState.stockLists);
    window.showInformationMessage(`Stock Successfully delete.`);
    if (cb && typeof cb === 'function') {
      cb(code);
    }
  }

  static addStockToBarCfg(code: string, cb?: Function) {
    const codeComponents = code.split('_');
    if (codeComponents.length < 3) {
      window.showInformationMessage(`Stock Id error.`);
      return;
    }
    const stockCode: string = codeComponents[2];

    const addStockToBar = () => {
      let configArr: string[] = this.getConfig('leek-fund.statusBarStock');
      if (configArr.length >= 4) {
        window.showInformationMessage(`StatusBar Exceeding Length.`);
        if (cb && typeof cb === 'function') {
          cb(code);
        }
      } else if (configArr.includes(stockCode)) {
        window.showInformationMessage(`StatusBar Already Have.`);
        if (cb && typeof cb === 'function') {
          cb(code);
        }
      } else {
        configArr.push(stockCode);
        this.setConfig('leek-fund.statusBarStock', configArr).then(() => {
          window.showInformationMessage(`Stock Successfully add to statusBar.`);
          if (cb && typeof cb === 'function') {
            cb(code);
          }
        });
      }
    };

    if (this.getConfig('leek-fund.hideStatusBarStock')) {
      this.setConfig('leek-fund.hideStatusBarStock', false).then(() => {
        addStockToBar();
      });
    } else {
      addStockToBar();
    }
  }

  static setStockTopCfg(code: string, cb?: Function) {
    if(!code) return;
    const codeComponents = code.split('_');
    if (codeComponents.length < 3) {
      window.showInformationMessage(`Stock Id error.`);
      return;
    }
    const index: number = parseInt(codeComponents[1]);
    const stockCode: string = codeComponents[2];
    const stocks = globalState.stockLists[index] as Array<string | number>;
    let updatedStocks = [stockCode, ...stocks.filter(item => item !== stockCode)];
    updatedStocks = clean(updatedStocks);
    updatedStocks = uniq(updatedStocks);
    globalState.stockLists[index] = updatedStocks as never;
    this.setConfig('leek-fund.stocks', globalState.stockLists).then(() => {
      window.showInformationMessage(`Stock successfully set to top.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }

  static setStockUpCfg(code: string, cb?: Function) {
    const codeComponents = code.split('_');
    if (codeComponents.length < 3) {
      window.showInformationMessage(`Stock Id error.`);
      return;
    }
    const callback = () => {
      window.showInformationMessage(`Stock successfully move up.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    };
    const index: number = parseInt(codeComponents[1]);
    const stockCode: string = codeComponents[2];
    const stocks = globalState.stockLists[index] as Array<string | number>;
    let currentIndex = stocks.indexOf(stockCode);
    let previousIndex = currentIndex - 1;
    if (previousIndex < 0) {
      callback();
    } else {
      // 交换位置
      [stocks[currentIndex], stocks[previousIndex]] = [stocks[previousIndex], stocks[currentIndex]]
      globalState.stockLists[index] = stocks as never;
      this.setConfig('leek-fund.stocks', globalState.stockLists).then(() => {
        callback();
      });
    }
  }

  static setStockDownCfg(code: string, cb?: Function) {
    const codeComponents = code.split('_');
    if (codeComponents.length < 3) {
      window.showInformationMessage(`Stock Id error.`);
      return;
    }
    const callback = () => {
      window.showInformationMessage(`Stock successfully move down.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    };
    const index: number = parseInt(codeComponents[1]);
    const stockCode: string = codeComponents[2];
    const stocks = globalState.stockLists[index] as Array<string | number>;
    let currentIndex = stocks.indexOf(stockCode);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= stocks.length) {
      callback();
    } else {
      // 交换位置
      [stocks[currentIndex], stocks[nextIndex]] = [stocks[nextIndex], stocks[currentIndex]]
      globalState.stockLists[index] = stocks as never;
      this.setConfig('leek-fund.stocks', globalState.stockLists).then(() => {
        callback();
      });
    }
  }
  // Stock End

  // Binance Begin
  static updateBinanceCfg(codes: string, cb?: Function) {
    this.updateConfig('leek-fund.binance', codes.split(',')).then(() => {
      window.showInformationMessage(`Pair Successfully add.`);
      if (cb && typeof cb === 'function') {
        cb(codes);
      }
    });
  }
  static removeBinanceCfg(code: string, cb?: Function) {
    this.removeConfig('leek-fund.binance', code).then(() => {
      window.showInformationMessage(`Pair Successfully delete.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }
  static setBinanceTopCfg(code: string, cb?: Function) {
    let configArr: string[] = this.getConfig('leek-fund.binance');
    configArr = [code, ...configArr.filter((item) => item !== code)];
    this.setConfig('leek-fund.binance', configArr).then(() => {
      window.showInformationMessage(`Pair successfully set to top.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }
  // Binance end

  // StatusBar Begin
  static updateStatusBarStockCfg(codes: Array<string>, cb?: Function) {
    const updateStatusBarStock = () => {
      this.setConfig('leek-fund.statusBarStock', codes).then(() => {
        window.showInformationMessage(`Status Bar Stock Successfully update.`);
        if (cb && typeof cb === 'function') {
          cb(codes);
        }
      });
    };

    if (codes.length) {
      if (this.getConfig('leek-fund.hideStatusBarStock')) {
        this.setConfig('leek-fund.hideStatusBarStock', false).then(() => {
          updateStatusBarStock();
        });
      } else {
        updateStatusBarStock();
      }
    } else {
      if (!this.getConfig('leek-fund.hideStatusBarStock')) {
        this.setConfig('leek-fund.hideStatusBarStock', true).then(() => {
          updateStatusBarStock();
        });
      } else {
        updateStatusBarStock();
      }
    }
  }
  // StatusBar End
}

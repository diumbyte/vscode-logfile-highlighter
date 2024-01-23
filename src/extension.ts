'use strict';

import * as vscode from 'vscode';
import CustomPatternController = require('./CustomPatternController');
import CustomPatternDecorator = require('./CustomPatternDecorator');
import TimePeriodCalculator = require('./TimePeriodCalculator');
import TimePeriodController = require('./TimePeriodController');
import ConfigurationController from './ConfigurationController';
import { CustomPatternTreeDataProvider, TreeItem } from './CustomPatternTreeDataProvider';
import { jumpToSelectedPattern } from './EditorUtils';

// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

    // create a new time calculator and controller
    const timeCalculator = new TimePeriodCalculator();
    const timeController = new TimePeriodController(timeCalculator);

    // create log level colorizer and -controller
    const customPatternDecorator = new CustomPatternDecorator();
    const customPatternController = new CustomPatternController(customPatternDecorator);

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(timeController, customPatternController);


    const configManager = new ConfigurationController();
    const treeDataProvider = new CustomPatternTreeDataProvider(configManager);
    
  
      vscode.commands.registerCommand('logFileHighlighter.editEntry', async (customPatternItem: TreeItem) =>{ 
      const selectedPattern = customPatternItem.label as string;
      jumpToSelectedPattern(selectedPattern);
    });
  
    vscode.commands.registerCommand('logFileHighlighter.refresh', () => {    
      treeDataProvider.refresh();
    });
  
  
    vscode.window.registerTreeDataProvider("logFileHighlighter", treeDataProvider);
    const treeView = vscode.window.createTreeView("logFileHighlighter", {
      treeDataProvider,
    });
    
    treeView.onDidChangeCheckboxState(e => configManager.updateProperty(e));
    
}

// this method is called when your extension is deactivated
export function deactivate() {
    // Nothing to do here
}

import * as vscode from 'vscode';
import {CustomPattern} from "./CustomPattern";
import {TreeItem} from './CustomPatternTreeDataProvider';

export default class ConfigurationController {
    private _configuration: vscode.WorkspaceConfiguration;

    get configuration(): vscode.WorkspaceConfiguration {
        this._configuration = vscode.workspace.getConfiguration("logFileHighlighter");
        return this._configuration;
    }

    set configuration(val: vscode.WorkspaceConfiguration) {
        this._configuration = val;
    }
    
    constructor() {
        this._configuration = vscode.workspace.getConfiguration("logFileHighlighter");
        const test = new Proxy(this.configuration, {
            get: (target, key) => {
                return vscode.workspace.getConfiguration("logHighlighter");
            }
        });
    }

    async getListOfPatterns():Promise<CustomPattern[]> {
        const availablePatterns:CustomPattern[] = this.configuration.get("customPatterns") ?? [] as CustomPattern[];

        // if(availablePatterns === undefined) {throw Error("Something went wrong!");}

        // const filledPatterns = availablePatterns.map(customPattern => {
        //     if(customPattern.category === undefined) {
        //         customPattern.category = "Ungrouped";
        //     }

        //     return customPattern;
        // });


        return availablePatterns;
    }

    async togglePattern(selectedPattern: string) {
        if (!this.configuration.has("customPatterns")) {
            throw Error("There are no customPatterns.");
        }
        
        const availablePatterns = await this.getListOfPatterns();
        if(availablePatterns === undefined) {
            throw Error("No available patterns were found.");
        }
        
        const foundPatternIdx = availablePatterns?.findIndex(patternObject => patternObject.pattern === selectedPattern);
        if(foundPatternIdx === undefined || foundPatternIdx === -1)
        {
            throw Error("No custom pattern matches the selected pattern");
        }

        availablePatterns[foundPatternIdx].active = !availablePatterns[foundPatternIdx].active;
        console.log(`Pattern ${availablePatterns[foundPatternIdx].pattern} found. Toggling active from ${!availablePatterns[foundPatternIdx].active} to ${availablePatterns[foundPatternIdx].active}`);
        

        await this.configuration.update("customPatterns", availablePatterns, vscode.ConfigurationTarget.Global);
    }

    async updateProperty(event:vscode.TreeCheckboxChangeEvent<TreeItem>) {
        const updatedTreeItem = event.items[0][0];
        await this.togglePattern(updatedTreeItem.label as string);
    }
}
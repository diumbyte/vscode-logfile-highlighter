import * as vscode from "vscode";
import { TreeItemCheckboxState } from "vscode";
import ConfigurationController from "./ConfigurationController";
import { CustomPattern } from "./CustomPattern";


export class CustomPatternTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | void> = new vscode.EventEmitter<TreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  data: TreeItem[];
  configManager: ConfigurationController;

  constructor(existingConfigManager?: ConfigurationController) {
    this.data = [];
    this.configManager = existingConfigManager ?? new ConfigurationController();
    this.populateTreeData(this.configManager);    
  }

  private populateTreeData(existingConfigManager: ConfigurationController) {
    existingConfigManager.getListOfPatterns().then(listOfPatterns => {
      this.data = [];
      const groupedPatternsByCategory = listOfPatterns.reduce((result, currentPatternItem) => {
        if(currentPatternItem.category ===  undefined) {
          // throw Error("Something went wrong.");
          currentPatternItem.category = "Ungrouped";
        }

        ((result as any)[currentPatternItem["category"]] = (result as any)[currentPatternItem["category"]] || []).push(currentPatternItem);

        return result;
      }, {});

      for (const [category, pattersUnderCategory] of Object.entries(groupedPatternsByCategory)) {
        const childrenTreeItems:TreeItem[] = (pattersUnderCategory as CustomPattern[]).map(customPattern => {
          return new TreeItem(customPattern.pattern, undefined, customPattern.active);
        });

        const categoryTreeItem = new TreeItem(category, childrenTreeItems, undefined);
        this.data.push(categoryTreeItem);
      }
    });
  }

  refresh() {
    this._onDidChangeTreeData.fire();
    this.populateTreeData(this.configManager);
    // Also what happens if there's two identical patterns? break?
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }

}

export class TreeItem extends vscode.TreeItem {
  children: TreeItem[] | undefined;

  constructor(label: string, children?: TreeItem[], initialCheckState?: boolean) {
    super(
      label,
      children === undefined ? vscode.TreeItemCollapsibleState.None :
        vscode.TreeItemCollapsibleState.Expanded);
    this.children = children;
    this.checkboxState = initialCheckState === undefined ? undefined : (initialCheckState === true ? TreeItemCheckboxState.Checked : TreeItemCheckboxState.Unchecked);
    this.contextValue =  initialCheckState === undefined ? undefined : "logOption";
  }

}

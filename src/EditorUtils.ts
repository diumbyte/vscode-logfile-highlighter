import * as vscode from 'vscode';


export async function jumpToSelectedPattern(pattern:string) {
    await vscode.commands.executeCommand("workbench.action.openSettingsJson");

    const activeEditor = vscode.window.activeTextEditor!;
    const settingsDocument = activeEditor.document;

    const settingsFileContent = settingsDocument.getText();
    const idxOfSelectedPattern = settingsFileContent.indexOf(pattern);
    const subBody = settingsFileContent.substring(0, idxOfSelectedPattern);
    const numberOfNewlinesBeforePattern = subBody.match(/\n/gi)?.length;
    if(numberOfNewlinesBeforePattern === undefined) {
      throw Error("Something went wrong!");
    }
    const range = settingsDocument.lineAt(numberOfNewlinesBeforePattern).range;
    activeEditor.selection = new vscode.Selection(range.start, range.end);
    activeEditor.revealRange(range);
    
    

    // This works but only brings the cursor to the beginning of the parent "logHighlighter.customPatterns" object
    // vscode.commands.executeCommand("workbench.action.openSettingsJson", {
    //   revealSetting: {
    //     key: "logHighlighter.customPatterns",
    //     edit: false
    //   }
    // });

}
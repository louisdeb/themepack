'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('themepack.helloWorld', () => {
		vscode.window.showInformationMessage('themepack!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

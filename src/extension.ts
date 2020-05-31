'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.commands.registerCommand('themepack.home', () => {
			HomePanel.createOrShow(context.extensionPath);
		})
	);

	// console.log(vscode.window.activeColorTheme);
}

export function deactivate() {}

class HomePanel {
	public static currentPanel: HomePanel | undefined; // singleton

	public static readonly viewType = 'home';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionPath: string) {
		const column = vscode.window.activeTextEditor
						? vscode.window.activeTextEditor.viewColumn
						: undefined;

		if (HomePanel.currentPanel) {
			HomePanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			HomePanel.viewType,
			'Home',
			column || vscode.ViewColumn.One,
			{
				enableScripts: true,

				// restricts resource access
				localResourceRoots: [
					vscode.Uri.file(path.join(extensionPath, 'media')),
					vscode.Uri.file(path.join(extensionPath, 'res'))
				]
			}
		);

		HomePanel.currentPanel = new HomePanel(panel, extensionPath);
	}

	public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
		HomePanel.currentPanel = new HomePanel(panel, extensionPath);
	}

	private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
		this._panel = panel;
		this._extensionPath = extensionPath;

		this._update();

		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible)
					this._update();
			},
			null,
			this._disposables
		);

		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert': 
						vscode.window.showErrorMessage(message.text);
						return;
				}
			}
		);
	}

	public dispose() {
		HomePanel.currentPanel = undefined;
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x)
				x.dispose();
		}
	}

	private _update() {
		const webview = this._panel.webview;

		this._panel.title = 'themepack';

		const htmlPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, '/res/html/index.html'));
		var html = fs.readFileSync(htmlPathOnDisk.path).toString();

		const stylePathOnDisk = vscode.Uri.file(path.join(this._extensionPath, '/res/css/styles.css'));
		const stylesUri = webview.asWebviewUri(stylePathOnDisk);
		html = html.replace('${stylesUri}', stylesUri.toString());

		const animationsPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, '/res/css/animations.css'));
		const animationsUri = webview.asWebviewUri(animationsPathOnDisk);
		html = html.replace('${animationsUri}', animationsUri.toString());

		const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, '/res/js/main.js'));
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
		html = html.replace('${scriptUri}', scriptUri.toString());

		const supplyDropImagePathOnDisk = vscode.Uri.file(path.join(this._extensionPath, '/media/supplydrop.png'));
		const supplyDropImageUri = webview.asWebviewUri(supplyDropImagePathOnDisk);
		html = html.replace('${supplyDropImageUri}', supplyDropImageUri.toString());

		webview.html = html;
	}
}

import * as assert from "assert";
import * as vscode from "vscode";
import { GroqService } from "../../groqService";
import { suite } from "mocha";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Extension should be present", () => {
    assert.ok(vscode.extensions.getExtension("your-publisher.snipply-copilot"));
  });

  test("GroqService initialization", () => {
    const service = new GroqService();
    assert.ok(service);
  });

  test("Configuration loading", () => {
    const config = vscode.workspace.getConfiguration("snipplyCopilot");
    assert.ok(config);
  });
});
